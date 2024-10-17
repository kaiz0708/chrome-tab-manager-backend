/** @format */
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
   service: "gmail",
   auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_PASSWORD,
   },
});

export function sendEmail(toEmail: string, subject: string, content: string): Promise<void> {
   let mail = {
      from: process.env.GMAIL_EMAIL,
      to: toEmail,
      subject: subject,
      html: content,
   };
   return new Promise((resolve, reject) => {
      transporter.sendMail(mail, (err: any) => {
         if (err) console.log(err);
         else resolve();
      });
   });
}
