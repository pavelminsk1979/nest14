
export class CreateUserDto {
  createdAt: string;

  constructor(
    public login: string,
    public passwordHash: string,
    public email: string,
  ) {
    this.createdAt = new Date().toISOString();
  }
}