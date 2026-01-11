import { ValueObject } from '@/shared/domain/value-object';

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  private static readonly EMAIL_REGEX =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  private constructor(props: EmailProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  private static isValidFormat(email: string): boolean {
    return this.EMAIL_REGEX.test(email);
  }

  private static normalize(email: string): string {
    return email.toLowerCase().trim();
  }

  static create() {}
}
