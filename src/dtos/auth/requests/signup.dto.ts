import { $Enums } from "@prisma/client";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class SignUpDto {
  @IsEmail()
  readonly email!: string;

  @IsString()
  readonly firstName!: string;

  @IsString()
  readonly lastName!: string;

  @IsOptional()
  @IsString()
  readonly role?: $Enums.Role;

  @IsString()
  @MinLength(4)
  readonly password!: string;
}
