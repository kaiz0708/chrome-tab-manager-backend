/** @format */

export const Template = {
   sendEmailNotiOtp: (otp: string) => {
      const emailHeader = "Change Password for Antinotion Account";
      const emailBody = `
                <h2>Antinotion Tab Manager</h2>
                <p>Your OTP code is: ${otp}</p>
                <p>Please return to the extension to confirm the code. The code expires in 5 minutes.</p>
            `;
      return {
         emailHeader,
         emailBody,
      };
   },
};
