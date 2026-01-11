import { UserStatusEnum } from '@/modules/user/domain/enums';

export class UserStatus {
  private readonly value: UserStatusEnum;

  constructor(status: string) {
    const validStatuses = Object.values(UserStatusEnum);
    if (!validStatuses.includes(status as UserStatusEnum))
      throw new Error(`Invalid status: ${status}`); // Update with InvalidUserStatusException
    this.value = status as UserStatusEnum;
  }

  getValue(): UserStatusEnum {
    return this.value;
  }

  isActive(): boolean {
    return this.value === UserStatusEnum.ACTIVE;
  }

  isSuspended(): boolean {
    return this.value === UserStatusEnum.SUSPENDED;
  }

  isDeleted(): boolean {
    return this.value === UserStatusEnum.DELETED;
  }
}
