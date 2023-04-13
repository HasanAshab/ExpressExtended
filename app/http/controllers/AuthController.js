const BaseController = controller('BaseController');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = model('User');
const Token = model('Token');
const ForgotPasswordMail = mail('ForgotPasswordMail');
const PasswordChanged = mail('PasswordChanged');
const frontendUrl = process.env.FRONTEND_URL;
const jwtSecret = process.env.JWT_SECRET;
const bcryptRounds = Number (process.env.BCRYPT_ROUNDS);
const tokenLifespan = Number (process.env.TOKEN_LIFESPAN);

class AuthController {
  static register = async (req, res) => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      name: Joi.string().required(),
      password: Joi.string().min(8).required(),
      password_confirmation: Joi.string().required().valid(Joi.ref('password')),
    });
    const { error } = schema.validate(req.body);
    if (error) throw error;

    const {
      name,
      email,
      password
    } = req.body;
    if (await User.findOne({
      email
    })) {
      return res.status(400).json({
        success: false, message: 'Email already exist!'
      });
    }
    const hash = await bcrypt.hash(password, bcryptRounds);
    const user = await User.create({
      name, email, password: hash
    });
    const token = jwt.sign({
      userId: user._id, version: user.tokenVersion
    }, jwtSecret, {
      expiresIn: tokenLifespan
    });
    user.sendVerificationEmail().then();
    res.json({
      success: true, message: 'Verification email sent!', token
    });
  }

  static async login(req, res) {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });
    const {
      error
    } = schema.validate(req.body);
    if (error) throw error;

    const {
      email,
      password
    } = req.body;
    const user = await User.findOne({
      email
    });
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = jwt.sign({
          userId: user._id, version: user.tokenVersion
        }, jwtSecret, {
          expiresIn: tokenLifespan
        });
        return res.json({
          success: true, message: 'Logged in successfully!', token
        });
      }
    }
    res.status(401).json({
      success: true, message: 'Credentials not match!'
    })
  }

  static verifyEmail = async (req, res) => {
    const schema = Joi.object({
      id: Joi.string().required(),
      token: Joi.string().required(),
    });
    const {
      error
    } = schema.validate(req.body);
    if (error) throw error;
    const {
      id,
      token
    } = req.query;
    const verificationToken = await Token.findOne({
      userId: id,
      for: 'email_verification'
    });
    if (!verificationToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token!"
      });
    }
    const tokenMatch = await bcrypt.compare(token, verificationToken.token);
    if (!tokenMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token!"
      });
    }
    User.findByIdAndUpdate(id, {
      emailVerified: true
    }, {
      new: false
    }).then();
    verificationToken.deleteOne().then();
    res.json({
      success: true, message: 'Email verified!'
    });
  }

  static resendEmailVerification = (req, res) => {
    req.user.sendVerificationEmail().then();
    return res.json({
      success: true, message: 'Verification email sent!'
    });
  }

  static forgotPassword = async (req, res) => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
    });
    const {
      error
    } = schema.validate(req.body);
    if (error) throw error;
    const email = req.body.email;
    const user = await User.findOne({
      email
    });
    if (user) {
      Token.deleteMany({
        userId: user._id,
        for: 'password_reset'
      }).then();
      const resetToken = randStr(128);
      const hash = await bcrypt.hash(resetToken,
        bcryptRounds);
      const token = Token.create({
        userId: user._id,
        token: hash,
        for: 'password_reset'
      }).then();
      const link = `${frontendUrl}/password/reset?id=${user._id}&token=${resetToken}`;
      user.notify(new ForgotPasswordMail({
        link
      }))
    }
    return res.json({
      success: true,
      message: 'Password reset email sent!'
    })
  }

  static resetPassword = async (req,
    res) => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      token: Joi.string().required(),
    });
    const {
      error
    } = schema.validate(req.body);
    if (error) throw error;
    const {
      id,
      token,
      password
    } = req.body;
    const user = await User.findById(id);
    const resetToken = await Token.findOne({
      userId: id
    });
    if (!resetToken || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token!"
      });
    }
    const tokenMatch = await bcrypt.compare(token, resetToken.token);
    if (!tokenMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token!"
      });
    }
    const oldPasswordMatch = await bcrypt.compare(password, user.password);
    if (oldPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "New password should not be same as old one!"
      });
    }
    const hash = await bcrypt.hash(password, bcryptRounds);
    user.password = hash;
    user.tokenVersion++;
    user.save().then();
    resetToken.deleteOne().then();
    return res.json({
      success: false,
      message: "Password reset successfully!"
    });
    user.notify(new PasswordChanged);
  }

  static changePassword = async (req, res) => {
    const schema = Joi.object({
      old_password: Joi.string().required(),
      password: Joi.string().min(8).required(),
    });
    const {
      error
    } = schema.validate(req.body);
    if (error) throw error;
    const user = req.user;
    return user.notify(new PasswordChanged);

    const {
      old_password,
      password
    } = req.body;
    const oldPasswordMatch = await bcrypt.compare(old_password, user.password);
    if (!oldPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password!"
      });
    }
    if (old_password === password) {
      return res.status(400).json({
        success: false,
        message: "New password should not be same as old one!"
      });
    }
    const hash = await bcrypt.hash(password, bcryptRounds);
    user.password = hash;
    user.tokenVersion++;
    user.save().then();
    return res.json({
      success: false,
      message: "Password changed successfully!"
    });
    user.notify(new PasswordChanged);
  }

  static profile = (req, res) => {
    res.json(req.user);
  }
  
  static test = async (req, res) => {
    //return res.json(await User.find({$text:{$search:req.body.q}}))
    //req.app.emit('test2', 8)
    const Test = event('Test');
    new Test('je')
    res.json('yeh')
  }
  
  
}

BaseController.wrapMethods(AuthController);
module.exports = AuthController;