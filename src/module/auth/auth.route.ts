/** @format */

import { DataResponse, InvalidRequest, OKResponse, UnauthorizedResponse } from "../../common/Responses";
import { Hono } from "hono";
import { setUserJWT } from "./auth.helper";
import { Environment } from "../../config/enviroment";
import { UserService } from "./auth.service";
import { loginValidation, registerUserValidation } from "./auth.validation";

export interface AuthEnv extends Environment {
   Variables: Environment["Variables"] & {
      userService: UserService;
   };
}

export const authRoute = new Hono<AuthEnv>()
   .use("*", async (c, next) => {
      const em = c.get("em");
      c.set("userService", new UserService(em));
      await next();
   })
   .post("/login", loginValidation, async (c) => {
      const { email, password } = c.req.valid("json");
      const userService = c.get("userService");

      const user = await userService.findUserByEmail(email);

      if (user == null) return UnauthorizedResponse(c, "username or password is incorrect");

      const isMatchPassword = await Bun.password.verify(password, user?.password);
      if (!isMatchPassword) return UnauthorizedResponse(c, "username or password is incorrect");

      const token = await setUserJWT(c, user);

      return DataResponse(
         c,
         {
            token,
            user,
         },
         "Login success"
      );
   })
   .post("/register", registerUserValidation, async (c) => {
      const userData = c.req.valid("json");

      const userService = c.get("userService");

      const user = await userService.createUser(userData);

      if (user == null) {
         return InvalidRequest(c, "user already exist");
      }
      const token = await setUserJWT(c, user);

      return DataResponse(c, { user, token }, "Register success");
   })
   .get("/expire", async (c) => {
      return OKResponse(c);
   });
