import bcrypt from "bcryptjs";

export class PasswordService {
  async hash(plain: string, saltRounds: number): Promise<string> {
    return bcrypt.hash(plain, saltRounds);
  }

  async verify(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}

