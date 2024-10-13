/** @format */

import { zValidator } from "@hono/zod-validator";
import { password } from "bun";
import { z } from "zod";

export const loginValidation = zValidator(
   "json",
   z.object({
      email: z.string(),
      password: z.string(),
   })
);

export const confirmRegisterValidation = zValidator(
   "query",
   z.object({
      code: z.string(),
   })
);

export const resetPasswordValidation = zValidator(
   "json",
   z.object({
      email: z.string(),
   })
);

export const changePasswordValidation = zValidator(
   "json",
   z.object({
      password: z.string(),
   })
);

export const queryChangePasswordValidation = zValidator(
   "query",
   z.object({
      code: z.string(),
   })
);

export const registerUserValidation = zValidator(
   "json",
   z.object({
      username: z.string().min(3, { message: "username must has length greater than 2" }).max(60, { message: "username must has length less than 50" }),
      email: z.string().email({ message: "invalid email format" }),
      password: z.string().min(8).max(100),
   })
);

export const registerValidation = zValidator(
   "query",
   z.object({
      code: z.string(),
   })
);

export const loginGoogleValidation = zValidator(
   "json",
   z.object({
      email: z.string(),
      username: z.string(),
   })
);
