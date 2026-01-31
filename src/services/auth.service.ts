import { SignUpDto } from "../dtos/auth/requests/signup.dto";
import { plainToInstance } from "class-transformer";
import { UserDto } from "../dtos/auth/responses/user.dto";
import { Conflict } from "http-errors";
import * as bcrypt from "bcrypt";

import prisma from "../prisma";
import { SignInDto } from "../dtos/auth/requests/signin.dto";
import { CredentialsDto } from "../dtos/auth/responses/signin.dto";
import jwt from "jsonwebtoken";
import { SignOutDto } from "../dtos/auth/requests/signout.dto";
import { ForgotPasswordDto } from "../dtos/auth/requests/forgot_password.dto";
import { ResetToken } from "../dtos/auth/responses/forgot_password.dto";
import { ResetPasswordDto } from "../dtos/auth/requests/reset_password.dto";
import * as nodemailer from "nodemailer";
import { transcode } from "buffer";

// TODO: Create a secure private key
const privateKey = "nerdery";

export class AuthService {
  static async createAccessToken(email: string): Promise<CredentialsDto> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Conflict("The email is not registered");
    }

    const authToken = await prisma.refreshToken.create({
      data: {
        userId: user?.userId,
        refreshToken: jwt.sign({ email, role: user!.role }, privateKey, {
          expiresIn: "60d",
        }),
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    });

    return plainToInstance(
      CredentialsDto,
      {
        refresh_token: authToken.refreshToken,
        expires_at: authToken.expiresAt,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  static async createResetToken(email: string): Promise<ResetToken> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Conflict("The email is not registered");
    }

    const authToken = await prisma.passwordReset.create({
      data: {
        userId: user?.userId,
        resetToken: jwt.sign({ email, role: user!.role }, privateKey, {
          expiresIn: "15m",
        }),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    return plainToInstance(
      ResetToken,
      {
        reset_token: authToken.resetToken,
        expires_at: authToken.expiresAt,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  static async disableToken(userId: string, token: string): Promise<void> {
    try {
      const authToken = await prisma.refreshToken.update({
        where: {
          refreshToken: token,
          userId,
        },
        data: {
          revoked: true,
        },
      });
    } catch (error) {
      throw Conflict("The provided token doesn't belong to that email");
    }
  }

  static async signup(body: SignUpDto): Promise<UserDto> {
    const exists = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (exists) {
      throw new Conflict("The email is already registered");
    }

    const user = await prisma.user.create({
      include: { address: {} },
      data: {
        ...body,
        password: await bcrypt.hash(body.password, 10),
        address: { create: {} },
      },
    });

    const authToken = await this.createAccessToken(user.email);

    return plainToInstance(
      UserDto,
      { ...user, ...authToken },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  static async signin(body: SignInDto): Promise<CredentialsDto> {
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (user) {
      const matches = await bcrypt.compare(body.password, user.password);
      if (!matches) {
        throw new Conflict("Incorrect password");
      }
    } else {
      throw new Conflict("The email is not registered");
    }
    // TODO: Improve logic
    const authToken = await this.createAccessToken(user.email);

    return authToken;
  }

  static async signout(body: SignOutDto): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      throw new Conflict("The email is not registered");
    }

    await this.disableToken(user.userId, body.refresh_token);
  }

  static async forgotPassword(body: ForgotPasswordDto): Promise<ResetToken> {
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      throw new Conflict("The email is not registered");
    }

    const mailer = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "luisrendon@ravn.co",
        pass: "",
      },
    });

    const resetPassword = await this.createResetToken(user.email);

    return resetPassword;
  }

  static async resetPassword(body: ResetPasswordDto): Promise<CredentialsDto> {
    const token = await prisma.passwordReset.findUnique({
      where: {
        resetToken: body.reset_token,
      },
    });

    if (!token) {
      throw Conflict("Invalid reset token");
    }

    if (token.expiresAt.getTime() < Date.now()) {
      throw Conflict("Token already expired, please start again");
    }

    const user = await prisma.user.update({
      where: {
        userId: token.userId,
      },
      data: {
        password: await bcrypt.hash(body.new_password, 10),
      },
    });

    await prisma.passwordReset.update({
      where: {
        resetToken: body.reset_token,
      },
      data: {
        consumed: true,
      },
    });

    await prisma.refreshToken.updateMany({
      where: {
        userId: user.userId,
      },
      data: {
        revoked: true,
      },
    });

    const newToken = await this.createAccessToken(user.email);

    return newToken;
  }
}
