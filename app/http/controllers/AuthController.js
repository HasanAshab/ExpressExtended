const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require(base('app/models/User'));
const Token = require(base('app/models/Token'));
const ForgotPasswordMail = require(base('app/mails/ForgotPasswordMail'));
const PasswordChanged = require(base('app/mails/PasswordChanged'));
const frontendUrl = process.env.FRONTEND_URL;
const bcryptRounds = Number(process.env.BCRYPT_ROUNDS);

class AuthController {
  static register = async (req, res) => {
    const { name, email, password } = req.body;
    const logo = req.files.logo;
    if (await User.findOne({email})) {
      return res.status(400).json({
        success: false,
        message: 'Email already exist!',
      });
    }
    const user = await User.create({
      name,
      email,
      password,
    });
    if (logo){
      await user.attachFile('logo', logo, true);
    }
    const token = user.createToken();
    user.sendVerificationEmail().catch((err) => log(err));
    res.status(201).json({
      success: true,
      message: 'Verification email sent!',
      token,
    });
  };

  static login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({
      email,
    });
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = user.createToken();
        return res.json({
          success: true,
          message: 'Logged in successfully!',
          token,
        });
      }
    }
    res.status(401).json({
      success: true,
      message: 'Credentials not match!',
    });
  };

  static verifyEmail = async (req, res) => {
    const { id, token } = req.query;
    const verificationToken = await Token.findOne({
      userId: id,
      for: 'email_verification',
    },
    {},
    { sort: { 'createdAt' : -1 } }
    );
    if (!verificationToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token!',
      });
    }
    const tokenMatch = await bcrypt.compare(token, verificationToken.token);
    if (!tokenMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token!',
      });
    }
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
    res.json({
      success: true,
      message: 'Email verified!',
    });
  };

  static resendEmailVerification = (req, res) => {
    req.user.sendVerificationEmail().catch((err) => log(err));
    return res.json({
      success: true,
      message: 'Verification email sent!',
    });
  };

  static forgotPassword = async (req, res) => {
    const email = req.body.email;
    const user = await User.findOne({
      email,
    });
    if (user) {
      Token.deleteMany({
        userId: user._id,
        for: 'password_reset',
      }).catch((err) => log(err));
      const resetToken = crypto.randomBytes(32).toString('hex');
      const token = await Token.create({
        userId: user._id,
        token: resetToken,
        for: 'password_reset',
      });
      const link = `${frontendUrl}/password/reset?id=${user._id}&token=${resetToken}`;
      user.notify(new ForgotPasswordMail({link}));
    }
    return res.json({
      success: true,
      message: 'Password reset email sent!',
    });
  };

  static resetPassword = async (req, res) => {
    const { id, token, password } = req.body;
    const user = await User.findById(id);
    const resetToken = await Token.findOne({
      userId: id,
    });
    if (!resetToken || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token!',
      });
    }
    const tokenMatch = await bcrypt.compare(token, resetToken.token);
    if (!tokenMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token!',
      });
    }
    const oldPasswordMatch = await bcrypt.compare(password, user.password);
    if (oldPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: 'New password should not be same as old one!',
      });
    }
    user.password = password;
    user.tokenVersion++;
    await user.save();
    resetToken.deleteOne().catch((err) => log(err));
    return res.json({
      success: false,
      message: 'Password reset successfully!',
    });
    user.notify(new PasswordChanged());
  };

  static changePassword = async (req, res) => {
    const user = req.user;
    const { old_password, password } = req.body;
    const oldPasswordMatch = await bcrypt.compare(old_password, user.password);
    if (!oldPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password!',
      });
    }
    if (old_password === password) {
      return res.status(400).json({
        success: false,
        message: 'New password should not be same as old one!',
      });
    }
    user.password = password;
    user.tokenVersion++;
    await user.save();
    return res.json({
      success: false,
      message: 'Password changed successfully!',
    });
    user.notify(new PasswordChanged());
  };

  static profile = (req, res) => {
    res.json(req.user);
  };
  
  static updateProfile = async (req, res) => {
    const { name, email } = req.body;
    req.user.name = name;
    req.user.email = email;
    req.user.emailVerified = false;
    const result = await req.user.save();
    if(result){
      req.user.sendVerificationEmail();
      return res.json({
        success: true,
        message: 'Verification email sent!',
      });
    }
    
  }
}

//curl -X POST   -F 'name=John Doe'   -F 'email=john108@example.com'   -F 'password=haomao.12'   -F 'password_confirmation=haomao.12'   -F 'profile=@p.jpg' http://127.0.0.1:8000/api/auth/register

//curl -X POST -F 'name=omi' -F 'profile=@p.jpg' http://127.0.0.1:8000/api/auth

module.exports = AuthController;