/** @format */

export const Template = {
   sendEmailNotiOtp: (otp: string) => {
      const emailHeader = "Change password account Antinotion";
      const emailBody = `
                <h2>Antinotion</h2>
                <p>Your otp code : ${otp}</p>
                <p>Please back to the extension to confirm the code, the code expires in 5 minutes</p>
            `;
      return {
         emailHeader,
         emailBody,
      };
   },
};
