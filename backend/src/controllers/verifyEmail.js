const User = require("../models/User");
const VerificationToken = require("../models/VerificationToken");

exports.verifyEmail = async (req, res) => {
  const { token, email } = req.query;

  try {
    const verificationToken = await VerificationToken.findOne({ token });

    if (!verificationToken) {
      return res.status(400).json({ message: "Invalid or expired token!" });
    }

    const user = await User.findById(verificationToken.userId);
    if (!user || user.email !== email) {
      return res.status(400).json({ message: "Invalid request!" });
    }

    user.isEmailVerified = true;
    await user.save();

    await VerificationToken.deleteOne({ _id: verificationToken._id });

    // Frontend redirect url
    res.redirect(`${process.env.FRONTEND_URL}/verify-success?email=${email}`);
  } catch (error) {
    console.log("Email Verification Error: ", error);
    res.status(500).json({ message: "Server Error!" });
  }
};
