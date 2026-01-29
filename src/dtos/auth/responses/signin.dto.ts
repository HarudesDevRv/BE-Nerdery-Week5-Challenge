import { Exclude, Expose } from "class-transformer";

@Exclude()
export class CredentialsDto {
  @Expose()
  readonly access_token!: string;

  @Expose()
  readonly expires_at!: Date;
}
