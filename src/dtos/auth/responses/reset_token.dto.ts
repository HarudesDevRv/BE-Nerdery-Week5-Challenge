import { Exclude, Expose } from "class-transformer";

@Exclude()
export class ResetTokenDto {
  @Expose()
  readonly reset_token!: string;

  @Expose()
  readonly expires_at!: Date;
}
