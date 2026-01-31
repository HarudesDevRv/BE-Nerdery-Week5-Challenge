import { plainToInstance } from "class-transformer";
import { Request, Response } from "express";
import { SignUpDto } from "../dtos/auth/requests/signup.dto";
import { validate } from "class-validator";
import { AuthService } from "../services/auth.service";
import { SignInDto } from "../dtos/auth/requests/signin.dto";
import { SignOutDto } from "../dtos/auth/requests/signout.dto";
import { ForgotPasswordDto } from "../dtos/auth/requests/forgot_password.dto";
import { ResetPasswordDto } from "../dtos/auth/requests/reset_password.dto";

export async function signup(req: Request, res: Response): Promise<void> {
  const dto = plainToInstance(SignUpDto, req.body);
  const errors = await validate(dto);

  if (errors.length > 0) {
    res.status(400).send({ message: "Validation failed", details: errors });
    return;
  }

  try {
    const result = await AuthService.signup(dto);

    res
      .status(200)
      .json({ message: "User successfully signed up", data: result });
  } catch (error: unknown) {
    if (error instanceof Error) {
      const statusCode = (error as any).statusCode || 500;

      res.status(statusCode).json({
        message: error.message || "Internal server error",
        name: error.name,
      });
    } else {
      res.status(500).json({
        message: "Internal server error",
        name: "UnknownError",
      });
    }
  }
}

export async function signin(req: Request, res: Response): Promise<void> {
  const dto = plainToInstance(SignInDto, req.body);
  const errors = await validate(dto);

  if (errors.length > 0) {
    res.status(400).send({ message: "Validation failed", details: errors });
    return;
  }

  try {
    const result = await AuthService.signin(dto);

    res
      .status(200)
      .json({ message: "User successfully signed in", data: result });
  } catch (error: unknown) {
    if (error instanceof Error) {
      const statusCode = (error as any).statusCode || 500;

      res.status(statusCode).json({
        message: error.message || "Internal server error",
        name: error.name,
      });
    } else {
      res.status(500).json({
        message: "Internal server error",
        name: "UnknownError",
      });
    }
  }
}

export async function signout(req: Request, res: Response): Promise<void> {
  const dto = plainToInstance(SignOutDto, req.body);
  const errors = await validate(dto);

  if (errors.length > 0) {
    res.status(400).send({ message: "Validation failed", details: errors });
    return;
  }

  try {
    await AuthService.signout(dto);

    res.status(204).json();
  } catch (error: unknown) {
    if (error instanceof Error) {
      const statusCode = (error as any).statusCode || 500;

      res.status(statusCode).json({
        message: error.message || "Internal server error",
        name: error.name,
      });
    } else {
      res.status(500).json({
        message: "Internal server error",
        name: "UnknownError",
      });
    }
  }
}

export async function forgotPassword(
  req: Request,
  res: Response,
): Promise<void> {
  const dto = plainToInstance(ForgotPasswordDto, req.body);
  const errors = await validate(dto);

  if (errors.length > 0) {
    res.status(400).send({ message: "Validation failed", details: errors });
    return;
  }

  try {
    const result = await AuthService.forgotPassword(dto);

    res
      .status(200)
      .json({ message: "Email sent for password reset", data: result });
  } catch (error: unknown) {
    if (error instanceof Error) {
      const statusCode = (error as any).statusCode || 500;

      res.status(statusCode).json({
        message: error.message || "Internal server error",
        name: error.name,
      });
    } else {
      res.status(500).json({
        message: "Internal server error",
        name: "UnknownError",
      });
    }
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
): Promise<void> {
  const dto = plainToInstance(ResetPasswordDto, req.body);
  const errors = await validate(dto);

  if (errors.length > 0) {
    res.status(400).send({ message: "Validation failed", details: errors });
    return;
  }

  try {
    const result = await AuthService.resetPassword(dto);

    res
      .status(200)
      .json({ message: "User password successfully changed", data: result });
  } catch (error: unknown) {
    if (error instanceof Error) {
      const statusCode = (error as any).statusCode || 500;

      res.status(statusCode).json({
        message: error.message || "Internal server error",
        name: error.name,
      });
    } else {
      res.status(500).json({
        message: "Internal server error",
        name: "UnknownError",
      });
    }
  }
}
