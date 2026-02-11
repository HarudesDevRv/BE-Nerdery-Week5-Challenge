import { IsEmail, IsJWT, IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
  @IsString()
  @MinLength(4)
  readonly new_password!: string;

  @IsJWT()
  readonly reset_token!: string;
}
