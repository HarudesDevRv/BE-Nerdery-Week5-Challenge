import express, { Router } from "express";
import asyncHandler from "express-async-handler";
import { signin, signup } from "../controllers/auth.controller";

const router = express.Router();

export function authRoutes(): Router {
  router.route("/signup").post(asyncHandler(signup));
  router.route("/signin").post(asyncHandler(signin));
  return router;
}
