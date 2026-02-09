import { Exclude, Expose } from "class-transformer";

@Exclude()
export class RefreshTokenDto {
  @Expose()
  readonly refresh_token!: string;

  @Expose()
  readonly expires_at!: Date;
}
