import { Request } from "express";
import { IUser } from "../models/user.model.js";

export interface IGetUserAuthInfoRequest extends Request {
  user: IUser;
}
