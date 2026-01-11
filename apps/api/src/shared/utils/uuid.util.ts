import { v7 as uuid } from 'uuid';

export class UuidUtil {
  static generate(): string {
    return uuid();
  }

  static isValid(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}
