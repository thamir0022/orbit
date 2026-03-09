export const getEmailVerificationTemplate = (otp: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 40px 20px; color: #1f2937;">
      <div style="max-width: 480px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        
        <h2 style="margin-top: 0; color: #111827;">Welcome to Orbit 👋</h2>
        
        <p style="font-size: 14px; line-height: 1.6;">
          Thanks for signing up! To complete your registration, please enter the verification code below:
        </p>

        <div style="
          background: #f3f4f6;
          padding: 16px;
          text-align: center;
          border-radius: 6px;
          font-size: 26px;
          letter-spacing: 6px;
          font-weight: 600;
          margin: 24px 0;
        ">
          ${otp}
        </div>

        <p style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">
          This code will expire in 10 minutes.
        </p>

        <p style="font-size: 13px; color: #6b7280;">
          If you didn’t create an account with Orbit, you can safely ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          © ${new Date().getFullYear()} Orbit. All rights reserved.
        </p>

      </div>
    </div>
  `
}
