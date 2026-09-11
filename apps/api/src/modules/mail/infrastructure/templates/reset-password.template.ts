export const getForgotPasswordTemplate = (otp: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2c3e50;">Orbit Platform</h2>
      <p>You requested a password reset. Please use the following OTP to proceed:</p>
      <div style="background: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
        ${otp}
      </div>
      <p>This code is valid for 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `
}
