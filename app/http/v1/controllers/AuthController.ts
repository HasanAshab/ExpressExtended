import { Request, Response } from "express";
import { log } from "helpers";
import { passErrorsToHandler } from "illuminate/decorators/class";
import Controller from "illuminate/controllers/Controller";
import AuthenticationError from "app/exceptions/AuthenticationError";
import bcrypt from "bcryptjs";
import User from "app/models/User";
import Token from "app/models/Token";
import ForgotPasswordMail from "app/mails/ForgotPasswordMail";
import PasswordChangedMail from "app/mails/PasswordChangedMail";

@passErrorsToHandler
export default class AuthController extends Controller {
  async register(req: Request, res: Response){
    const { name, email, password } = req.validated;
    const logo = req.files?.logo;
    if (await User.findOne({ email })) throw AuthenticationError.type("EMAIL_EXIST").create();
    const user = await User.create({
      name,
      email,
      password,
    });
    if (logo && !Array.isArray(logo)) await user.attachFile("logo", logo, true);
    const token = user.createToken();
    req.app.emit("Registered", user);
    res.status(201).api({
      message: "Verification email sent!",
      token,
    });
  };

  async login(req: Request, res: Response){
    const { email, password } = req.validated;
    const user = await User.findOne({email});
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = user.createToken();
        res.api({
          token,
          message: "Logged in successfully!",
        });
      }
    }
    else throw AuthenticationError.type("INVALID_CREDENTIALS").create();
  };

  async verifyEmail(req: Request, res: Response){
    const { id, token } = req.validated;
    const verificationToken = await Token.findOne(
      {
        userId: id,
        for: "email_verification",
      },
      {},
      { sort: { createdAt: -1 } }
    );
    if (!verificationToken) throw AuthenticationError.type("INVALID_OR_EXPIRED_TOKEN").create();
    const tokenMatch = await bcrypt.compare(token, verificationToken.token);
    if (!tokenMatch) throw AuthenticationError.type("INVALID_OR_EXPIRED_TOKEN").create();

    await User.findByIdAndUpdate(
      id,
      {
        emailVerified: true,
      },
      {
        new: false,
      }
    );
    verificationToken.deleteOne().catch((err) => log(err));
    res.api({
      message: "Email verified!",
    });
  };

  async resendEmailVerification(req: Request, res: Response){
    await req.user!.sendVerificationEmail();
     res.api({
      message: "Verification email sent!",
    });
  };

  async forgotPassword(req: Request, res: Response){
    const email = req.validated.email;
    const user = await User.findOne({
      email,
    });
    if (user) {
      await user.sendResetPasswordEmail();
    }
     res.api({
      message: "Password reset email sent!",
    });
  };

  async resetPassword(req: Request, res: Response){
    const { id, token, password } = req.validated;
    const user = await User.findById(id);
    if (user) {
      await user.resetPassword(token, password)
       res.api({
        message: "Password reset successfully!",
      });
    }
    else res.status(404).api({
      message: "User not found!",
    });
  };

  async changePassword(req: Request, res: Response){
    const user = req.user!;
    const { old_password, password } = req.validated;
    const oldPasswordMatch = await bcrypt.compare(old_password, user.password);
    if (!oldPasswordMatch) throw AuthenticationError.type("INCORRECT_PASSWORD").create();
    if (old_password === password) throw AuthenticationError.type("PASSWORD_SHOULD_DIFFERENT").create();
    user.password = password;
    user.tokenVersion++;
    await user.save();
    await user.notify(new PasswordChangedMail());
     res.api({
      message: "Password changed successfully!",
    });
  };

  async profile(req: Request, res: Response){
     res.api({data:req.user!});
  };

  async updateProfile(req: Request, res: Response){
    const { name, email } = req.validated;
    const logo = req.files?.logo;
    const user = req.user!;
    user.name = name;
    user.email = email;
    user.emailVerified = false;
    const result = await user.save();
    if (logo && !Array.isArray(logo)) {
      await user.removeFiles("logo");
      await user.attachFile("logo", logo, true);
    }
    if (result) {
      await user.sendVerificationEmail();
       res.api({
        message: "Verification email sent!",
      });
    }
  };
}