/** @format */

import { DataResponse, InvalidRequest, OKResponse, UnauthorizedResponse } from "../../common/Responses";
import { Hono } from "hono";
import { setUserJWT } from "./auth.helper";
import { Environment } from "../../config/enviroment";
import { UserService } from "./auth.service";
import { loginValidation, registerUserValidation, loginGoogleValidation, changePasswordValidation, resetPasswordValidation, verifyOtpCodeValidation } from "./auth.validation";
import { generateOTP } from "@/common/utils/utils";
import { sendEmail } from "@/common/Sendmails";
import { Template } from "@/common/utils/template";
import { hash } from "@/common/Crypto";

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
   })
   .post("/google/login", loginGoogleValidation, async (c) => {
      const userData = c.req.valid("json");
      const userService = c.get("userService");
      const newUser = await userService.createUserLoginGoogle(userData);
      if (newUser != null) {
         const token = await setUserJWT(c, newUser);
         return DataResponse(
            c,
            {
               token,
               user: newUser,
            },
            "Login success"
         );
      }
   })
   .post("/forgot-password", resetPasswordValidation, async (c) => {
      const { email } = c.req.valid("json");
      const userService = c.get("userService");
      const em = c.get("em");
      const user = await userService.findUserByEmail(email);
      if (user == null) {
         return InvalidRequest(c, "email not found");
      }
      const otp = generateOTP();
      const timestamp: number = Date.now();
      user.otp = otp;
      user.timeOtp = timestamp;
      await em.persistAndFlush(user);
      const { emailBody, emailHeader } = Template.sendEmailNotiOtp(otp);
      sendEmail(user.email || "", emailHeader, emailBody);
      return DataResponse(c, { data: "success" }, "Check your email to verify otp code");
   })
   .post("/verify-otp", verifyOtpCodeValidation, async (c) => {
      const { email, code } = c.req.valid("json");
      const userService = c.get("userService");
      const user = await userService.findUserByEmail(email);
      if (user == null) {
         return InvalidRequest(c, "email not found");
      }
      const timestamp: number = Date.now();
      if (user.otp !== code || timestamp - user.timeOtp > 120000) {
         return InvalidRequest(c, "verify otp code fail");
      }
      return DataResponse(c, { data: "success" }, "verify otp code success");
   })
   .post("/change-password", changePasswordValidation, async (c) => {
      const { password, email } = c.req.valid("json");
      const userService = c.get("userService");
      const user = await userService.findUserByEmail(email);
      console.log(user);
      if (user == null) {
         return UnauthorizedResponse(c, "email not exist");
      }

      await userService.updateUser(user.id, {
         password: await hash(password),
      });

      return DataResponse(c, { data: "success" }, "Change password success");
   });
