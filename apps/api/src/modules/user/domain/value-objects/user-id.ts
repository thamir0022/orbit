import { ValueObject } from '@/shared/domain/value-object';
import { UuidUtil } from '@/shared/utils';

interface UserIdProps {
  value: string;
}

/**
 * UserId Value Object
 * Encapsulates user identifier validation and generation
 */
export class UserId extends ValueObject<UserIdProps> {
  private constructor(props: UserIdProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(id?: string): UserId {
    const value = id || UuidUtil.generate();

    if (id && !UuidUtil.isValid(id)) {
      throw new Error('Invalid UserId format');
    }

    return new UserId({ value });
  }

  static fromString(id: string): UserId {
    return new UserId({ value: id });
  }
}
