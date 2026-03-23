export enum AuthResponseMessage {
  // Authentication
  SIGNUP_INITIATE_SUCCESS = 'We’ve sent a verification code to your email.',
  SIGNUP_VERIFY_SUCCESS = 'Email verified successfully.',
  SIGNUP_DETAILS_SUCCESS = 'Your account details have been saved.',
  SIGNUP_COMPLETE_SUCCESS = 'Your organization has been created successfully.',
  SIGN_IN_SUCCESS = 'Welcome back! You’re now signed in.',
  REFRESH_SUCCESS = 'Your session has been refreshed.',

  // Password Reset Flow
  PASSWORD_RESET_REQUEST_SUCCESS = 'We’ve sent a password reset code to your email.',
  PASSWORD_RESET_VERIFY_SUCCESS = 'Verification successful. You can now reset your password.',
  PASSWORD_RESET_CONFIRM_SUCCESS = 'Your password has been updated successfully.',
  PASSWORD_RESET_OTP_RESEND_SUCCESS = 'We’ve sent a new password reset code to your email.',

  // OAuth
  OAUTH_REDIRECT_INITIATED = 'Redirecting you to the authentication provider...',
  OAUTH_VERIFY_SUCCESS = 'Your account has been successfully linked.',
}
