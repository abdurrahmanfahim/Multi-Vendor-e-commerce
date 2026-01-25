const User = require("../models/User");
const VerificationToken = require("../models/VerificationToken");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

exports.register = async (req, res) => {
  console.log("first");

  try {
    const { name, email, password, phone, role } = req.body;

    // Simple Validation
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Name, Email and Password are required!",
      });
    }

    // Check if user already exist
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered!",
      });
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      phone: phone || undefined,
      role: role || "customer",
    });

    // save user
    await user.save();

    // Create verification Token
    const token = uuidv4();
    await new VerificationToken({ userId: user._id, token }).save();

    // Send Email
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const verificationUrl = `${process.env.APP_URL}/api/v1/auth/verify-email?token=${token}&email=${user.email}`;

    const mailOption = {
      from: `${process.env.SHOP_NAME}, <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Verify Your Email - ${process.env.SHOP_NAME}`,
      html: `<body style="font-family: Arial, sans-serif; color: #333;"> <h2>${process.env.SHOP_NAME}</h2> <p>Hello, ${user.name}</p> <p> Thank you for signing up with <strong>${process.env.SHOP_NAME}</strong>. Please verify your email address by clicking the link below: </p> <p> <a href="${verificationUrl}"> Verify your email </a> </p> <p> If you did not create an account, you can safely ignore this email. </p> <p>This link will expire in 24 hours.</p> <p> Regards,<br /> <strong>${process.env.SHOP_NAME} Team</strong> </p> </body>`,
    };

    try {
      await transporter.sendMail(mailOption);
      console.log("Email sent!");
    } catch (error) {
      console.error("Email send error: ", error);
    }

    res.status(201).json({
      success: true,
      message: "Registration Successful, Please Login!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration!",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and Password required" });
    }

    // Find user and select password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials!" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials!" });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
    );

    // save tokens to user
    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date(),
      // expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), optional
    });

    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Login Successful!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.log("Login Error: ", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during Login!" });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({ message: "No refresh token found!" });
    }

    // Find user with the refresh token
    const user = await User.findOne({
      refreshTokens: {
        $elemMatch: {
          token: refreshToken,
        },
      },
    });

    // OR
    // const user = await User.findOne({ "refreshTokens.token": refreshToken });

    if (!user) {
      res.clearCookie("refreshToken");
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Verify refresh token
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (error, decoded) => {
        if (error) {
          res.clearCookie("refreshToken");
          return res
            .status(403)
            .json({ message: "Invalid or expire refresh token" });
        }

        const newAccessToken = jwt.sign(
          { id: user._id, role: user.role, email: user.email },
          process.env.JWT_ACCESS_SECRET,
          { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
        );

        res.status(200).json({success: true, accessToken: newAccessToken})
      },
    );
  } catch (error) {
    console.log('Server error during handle with refresh token: ', error)
    res.status(500).json({message: 'Server error!'})
  }
};
