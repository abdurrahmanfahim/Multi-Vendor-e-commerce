const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"${process.env.SHOP_NAME}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email successfully sent to: ${to}`);
    return { success: true };
  } catch (error) {
    console.error("Email send error: ", error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };