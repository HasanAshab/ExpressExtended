import { Request, Response } from "express";
import { log, customError } from "helpers";
import bcrypt from "bcryptjs";
import User from "app/models/User";
import ForgotPasswordMail from "app/mails/ForgotPasswordMail";
import PasswordChangedMail from "app/mails/PasswordChangedMail";
import Mail from "illuminate/utils/Mail"

export default class AuthController {
  async register(req: Request){
    const { name, email, password } = req.validated;
    const logo = req.files?.logo;
    if (await User.findOne({ email })) throw customError("EMAIL_EXIST");
    const user = await User.create({
      name,
      email,
      password,
    });
    if (logo && !Array.isArray(logo)) await user.attach("logo", logo, true);
    const token = user.createToken();
    req.app.emit("Registered", user);
    return {
      status: 201,
      token,
      message: "Verification email sent!",
    };
  };

  async login(req: Request){
    const { email, password } = req.validated;
    const user = await User.findOne({email});
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = user.createToken();
        return {
          token,
          message: "Logged in successfully!",
        };
      }
    }
    throw customError("INVALID_CREDENTIALS");
  };

  async verifyEmail(req: Request){
    await User.findByIdAndUpdate(req.params.id, {emailVerified: true}, {new: false});
    return {
      message: "Email verified!",
    };
  };

  async resendEmailVerification(req: Request){
    const user = await User.findOne({email: req.validated.email});
    user && await user.sendVerificationEmail();
    return {
      message: "Verification email sent!",
    };
  };

  async forgotPassword(req: Request){
    const email = req.validated.email;
    const user = await User.findOne({
      email,
    });
    if (user) {
      await user.sendResetPasswordEmail();
    }
    return {
      message: "Password reset email sent!",
    };
  };

  async resetPassword(req: Request){
    const { id, password, token } = req.validated;
    const user = await User.findById(id);
    if (user) {
      await user.resetPassword(token, password);
      return {
        message: "Password changed successfully!",
      };
    }
    return {
      status: 404,
      message: "User not found!",
    };
  };

  async changePassword(req: Request){
    const user = req.user!;
    const { old_password, password } = req.validated;
    const oldPasswordMatch = await bcrypt.compare(old_password, user.password);
    if (!oldPasswordMatch) throw customError("INCORRECT_PASSWORD");
    if (old_password === password) throw customError("PASSWORD_SHOULD_DIFFERENT");
    user.password = password;
    user.tokenVersion++;
    await user.save();
    await Mail.to(user.email).send(new PasswordChangedMail());
    return {
      message: "Password changed successfully!",
    };
  };

  async profile(req: Request){
    return {data:req.user};
  };

  async updateProfile(req: Request){
    const { name, email } = req.validated;
    const logo = req.files?.logo;
    const user = req.user!;
    user.name = name;
    user.email = email;
    user.emailVerified = false;
    const result = await user.save();
    if (logo && !Array.isArray(logo)) {
      await user.detach("logo");
      await user.attach("logo", logo, true);
    }
    if (result) {
      await user.sendVerificationEmail();
      return {
        message: "Verification email sent!",
      };
    }
  };
}