/** @format */

import {
   DataResponse,
   InvalidRequest,
   UnauthorizedResponse,
} from "../../common/Responses";
import { Hono } from "hono";
import { setUserJWT } from "./auth.helper";
import { Environment } from "../../config/enviroment";
import { requirePermission } from "../../middleware/auth.middleware";
import { decrypt, encrypt, hash } from "../../common/Crypto";
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
      console.log(email);
      const userService = c.get("userService");

      const user = await userService.findUserByEmail(email);

      console.log(user);

      if (user == null)
         return UnauthorizedResponse(c, "username or password is incorrect");

      const isMatchPassword = await Bun.password.verify(
         password,
         user?.password
      );
      console.log(isMatchPassword);
      if (!isMatchPassword)
         return UnauthorizedResponse(c, "username or password is incorrect");

      console.log("check");

      const token = await setUserJWT(c, user);

      return DataResponse(c, {
         token,
         user,
      });
   })
   .post("/register", registerUserValidation, async (c) => {
      const userData = c.req.valid("json");

      const userService = c.get("userService");

      const user = await userService.createUser(userData);

      if (user == null) {
         return InvalidRequest(c, "user already exist");
      }
      const token = await setUserJWT(c, user);

      return DataResponse(c, { user, token });
   });
