import { SignUpDto } from "../dtos/auth/requests/signup.dto";
import { plainToInstance } from "class-transformer";
import { UserDto } from "../dtos/auth/responses/user.dto";
import { Conflict } from "http-errors";
import * as bcrypt from "bcrypt";

import prisma from "../prisma";
import { SignInDto } from "../dtos/auth/requests/signin.dto";
import { CredentialsDto } from "../dtos/auth/responses/signin.dto";
import jwt, { JwtPayload } from "jsonwebtoken";
import { SignOutDto } from "../dtos/auth/requests/signout.dto";

// TODO: Create a secure private key
const privateKey = "nerdery";

export class AuthService {
  static async signup(body: SignUpDto): Promise<UserDto> {
    const exists = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (exists) {
      throw new Conflict("User with this email already exists");
    }

    const user = await prisma.user.create({
      include: { address: {} },
      data: {
        ...body,
        password: await bcrypt.hash(body.password, 10),
        authToken: jwt.sign(
          { email: body.email, role: body.role ? body.role : "Client" },
          privateKey,
          {
            expiresIn: "60d",
          },
        ),
        address: { create: {} },
      },
    });

    return plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });
  }

  static async refreshToken(email: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { email } });
    const updatedUser = await prisma.user.update({
      where: {
        email,
      },
      data: {
        authToken: jwt.sign({ email, role: user!.role }, privateKey, {
          expiresIn: "60d",
        }),
      },
    });
    return updatedUser.authToken!;
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

    let access_token: string = "";
    let expires_at: Date = new Date();
    // TODO: Improve logic
    if (user.authToken !== null) {
      try {
        const jwtToken = jwt.verify(user.authToken, privateKey) as JwtPayload;
        expires_at = new Date(jwtToken.exp! * 1000);
        access_token = user.authToken;
      } catch (error) {
        access_token = await this.refreshToken(user.email);
        const jwtToken = jwt.verify(access_token, privateKey) as JwtPayload;
        expires_at = new Date(jwtToken.exp! * 1000);
      }
    } else {
      access_token = await this.refreshToken(user.email);
      const jwtToken = jwt.verify(access_token, privateKey) as JwtPayload;
      expires_at = new Date(jwtToken.exp! * 1000);
    }

    return plainToInstance(CredentialsDto, { access_token, expires_at });
  }

  static async signout(body: SignOutDto): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (user) {
      const updatedUser = await prisma.user.update({
        where: {
          email: body.email,
        },
        data: {
          authToken: null,
        },
      });
    } else {
      throw new Conflict("The email is not registered");
    }
  }

  static async forgotPassword() {}

  static async resetPassword() {}
}
