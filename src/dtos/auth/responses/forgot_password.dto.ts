import { Exclude, Expose } from "class-transformer";

@Exclude()
export class ResetToken {
  @Expose()
  readonly reset_token!: string;

  @Expose()
  readonly expires_at!: Date;
}
