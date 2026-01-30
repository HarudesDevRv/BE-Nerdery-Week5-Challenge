import express, { Router } from "express";
import asyncHandler from "express-async-handler";
import {
  forgotPassword,
  resetPassword,
  signin,
  signout,
  signup,
} from "../controllers/auth.controller";

const router = express.Router();

export function authRoutes(): Router {
  router.route("/signup").post(asyncHandler(signup));
  router.route("/signin").post(asyncHandler(signin));
  router.route("/signout").post(asyncHandler(signout));
  router.route("/forgot-password").post(asyncHandler(forgotPassword));
  router.route("/reset-password").post(asyncHandler(resetPassword));
  return router;
}
