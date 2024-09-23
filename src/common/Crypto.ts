/** @format */

import crypto from "crypto";

const IV_LENGTH = 16;
const ENC_KEY = Buffer.from(process.env.SECRET?.repeat(3) + "12345" || "");

function toText(data: Object | string) {
   if (typeof data === "object") {
      return JSON.stringify(data).toString();
   }
   if (typeof data === "string") {
      return data;
   }
}

function toData(text: string) {
   try {
      return JSON.parse(text);
   } catch (_) {
      return text;
   }
}

export function encrypt(data: Object | string) {
   let text = toText(data);
   let iv = crypto.randomBytes(IV_LENGTH);
   let cipher = crypto.createCipheriv("aes-256-cbc", ENC_KEY, iv);

   let encrypted = cipher.update(text || "", "utf8", "hex");
   encrypted += cipher.final("hex");

   return iv.toString("hex") + ":" + encrypted;
}

export function decrypt(cipherText: string) {
   let [ivHex, encrypted] = cipherText.split(":");
   let iv = Buffer.from(ivHex, "hex");

   let decipher = crypto.createDecipheriv("aes-256-cbc", ENC_KEY, iv);

   let decrypted = decipher.update(encrypted, "hex", "utf8");
   decrypted += decipher.final("utf8");

   return toData(decrypted);
}

export async function hash(text: string) {
   // if (getRuntimeKey() === 'node') {
   //     return await bcrypt.hash(text, 10)
   // }
   return await Bun.password.hash(text, {
      algorithm: "bcrypt",
      cost: 10,
   });
}
