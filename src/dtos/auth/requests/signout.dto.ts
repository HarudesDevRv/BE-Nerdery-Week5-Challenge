import { IsEmail, IsJWT } from "class-validator";

export class SignOutDto {
  @IsEmail()
  readonly email!: string;

  @IsJWT()
  readonly refresh_token!: string;
}
