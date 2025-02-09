/** @format */

import { ResponseToJson } from "../../common/Responses";
import { Hono } from "hono";
import { setUserJWT } from "./auth.helper";
import { Environment } from "../../config/enviroment";
import { UserService } from "./auth.service";
import { loginValidation, registerUserValidation, loginGoogleValidation, changePasswordValidation, resetPasswordValidation, verifyOtpCodeValidation } from "./auth.validation";
import { generateOTP } from "@/common/utils/utils";
import { sendEmail } from "@/common/Sendmails";
import { Template } from "@/common/utils/template";
import { hash } from "@/common/Crypto";
import { HttpResponseBuilder, HttpStatusCode } from "@anot/http-response-builder";
import { User } from "@/model/user.model";

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

      if (user == null) {
         const resUnauthorized = HttpResponseBuilder.unauthorized().setMessage("Username or password is incorrect").build();
         return ResponseToJson(c, resUnauthorized, HttpStatusCode.UNAUTHORIZED);
      }

      const isMatchPassword = await Bun.password.verify(password, user?.password);
      if (!isMatchPassword) {
         const resUnauthorized = HttpResponseBuilder.unauthorized().setMessage("Username or password is incorrect").build();
         return ResponseToJson(c, resUnauthorized, HttpStatusCode.UNAUTHORIZED);
      }

      const token = await setUserJWT(c, user);

      const resOk = HttpResponseBuilder.ok<{ token: string; user: User }>()
         .setData({
            token,
            user,
         })
         .setMessage("Login successful")
         .build();
      return ResponseToJson(c, resOk, HttpStatusCode.OK);
   })
   .post("/register", registerUserValidation, async (c) => {
      const userData = c.req.valid("json");

      const userService = c.get("userService");

      const user = await userService.createUser(userData);

      if (user == null) {
         const resBadRequest = HttpResponseBuilder.badRequest().setMessage("User already exist").build();
         return ResponseToJson(c, resBadRequest, HttpStatusCode.BAD_REQUEST);
      }
      const token = await setUserJWT(c, user);

      const resOk = HttpResponseBuilder.ok<{ user: User; token: string }>()
         .setData({
            user,
            token,
         })
         .setMessage("Registration successful")
         .build();

      return ResponseToJson(c, resOk, HttpStatusCode.OK);
   })
   .get("/expire", async (c) => {
      const resOk = HttpResponseBuilder.ok().build();
      return ResponseToJson(c, resOk, HttpStatusCode.OK);
   })
   .post("/google/login", loginGoogleValidation, async (c) => {
      const userData = c.req.valid("json");
      const userService = c.get("userService");
      const newUser = await userService.createUserLoginGoogle(userData);
      if (newUser != null) {
         const token = await setUserJWT(c, newUser);
         const resOk = HttpResponseBuilder.ok<{ user: User; token: string }>()
            .setData({
               user: newUser,
               token,
            })
            .setMessage("Login successful")
            .build();

         return ResponseToJson(c, resOk, HttpStatusCode.OK);
      }
   })
   .post("/forgot-password", resetPasswordValidation, async (c) => {
      const { email } = c.req.valid("json");
      const userService = c.get("userService");
      const em = c.get("em");
      const user = await userService.findUserByEmail(email);

      if (user == null) {
         const resBadRequest = HttpResponseBuilder.badRequest().setMessage("Email not found").build();
         return ResponseToJson(c, resBadRequest, HttpStatusCode.BAD_REQUEST);
      }

      const otp = generateOTP();
      const timestamp: number = Date.now();
      user.otp = otp;
      user.timeOtp = timestamp;

      await em.persistAndFlush(user);

      const { emailBody, emailHeader } = Template.sendEmailNotiOtp(otp);

      sendEmail(user.email || "", emailHeader, emailBody);

      const resOk = HttpResponseBuilder.ok<{ data: string }>().setData({ data: "success" }).setMessage("Please check your email to verify the OTP code").build();
      return ResponseToJson(c, resOk, HttpStatusCode.OK);
   })
   .post("/verify-otp", verifyOtpCodeValidation, async (c) => {
      const { email, code } = c.req.valid("json");
      const userService = c.get("userService");
      const user = await userService.findUserByEmail(email);

      if (user == null) {
         const resBadRequest = HttpResponseBuilder.badRequest().setMessage("Email not found").build();
         return ResponseToJson(c, resBadRequest, HttpStatusCode.BAD_REQUEST);
      }

      const timestamp: number = Date.now();

      if (user.otp !== code || timestamp - user.timeOtp > parseInt(process.env.EXPIRE_CODE_OTP || "")) {
         const resBadRequest = HttpResponseBuilder.badRequest().setMessage("Failed to verify OTP code").build();
         return ResponseToJson(c, resBadRequest, HttpStatusCode.BAD_REQUEST);
      }

      const resOk = HttpResponseBuilder.ok<{ data: string }>().setData({ data: "success" }).setMessage("Successfully verified OTP code").build();
      return ResponseToJson(c, resOk, HttpStatusCode.OK);
   })
   .post("/change-password", changePasswordValidation, async (c) => {
      const { password, email } = c.req.valid("json");
      const userService = c.get("userService");
      const user = await userService.findUserByEmail(email);
      if (user == null) {
         const resBadRequest = HttpResponseBuilder.badRequest().setMessage("Email not found").build();
         return ResponseToJson(c, resBadRequest, HttpStatusCode.BAD_REQUEST);
      }

      await userService.updateUser(user.id, {
         password: await hash(password),
      });

      const resOk = HttpResponseBuilder.ok<{ data: string }>().setData({ data: "success" }).setMessage("Successfully changed password").build();
      return ResponseToJson(c, resOk, HttpStatusCode.OK);
   });
