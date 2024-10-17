/** @format */

export const Template = {
   sendEmailNotiOtp: (otp: string) => {
      const emailHeader = "Change password account Antinotion";
      const emailBody = `
                <h2>Antinotion</h2>
                <p>Your code otp for you : ${otp}</p>
            `;
      return {
         emailHeader,
         emailBody,
      };
   },
};
