export class Password {
  private readonly value: string;
  private readonly minLength = 8; // UPDATE WITH ENV
  private readonly maxLength = 128; // UPDATE WITH ENV

  constructor(password: string) {
    this.validate(password);
    this.value = password;
  }

  private validate(password: string): void {
    if (password.length < this.minLength)
      throw new Error(`Password must be at least ${this.minLength} characters`); // UPDATE WITH PasswordException

    if (password.length > this.maxLength)
      throw new Error(`Password must not exceed ${this.maxLength} characters`); // UPDATE WITH PasswordException

    if (!/[A-Z]/.test(password))
      throw new Error('Password must contain at least one uppercase character'); // UPDATE WITH PasswordException

    if (!/[a-b]/.test(password))
      throw new Error('Password must contain at least one lower character'); // UPDATE WITH PasswordException

    if (!/\d/.test(password))
      throw new Error('Password must contain at least one number'); // UPDATE WITH PasswordException

    if (!/[!@#$%^&*()_+\-=[\]{};:'",.<>?/\\|`~]/.test(password))
      throw new Error('Password must contain at least one special character'); // UPDATE WITH PasswordException
  }
}
