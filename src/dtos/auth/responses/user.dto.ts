import { $Enums } from "@prisma/client";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class UserDto {
  @Expose()
  readonly firstName!: string;

  @Expose()
  readonly lastName!: string;

  @Expose()
  readonly email!: string;

  @Expose()
  readonly role!: $Enums.Role;

  @Expose()
  readonly refresh_token!: string;

  @Expose()
  readonly expires_at!: Date;
}
