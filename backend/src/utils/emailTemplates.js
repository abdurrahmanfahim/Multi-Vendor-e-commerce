const { sendEmail } = require("./emailService");

const baseStyle = `
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 550px;
  margin: 40px auto;
  padding: 20px;
  border-top: 4px solid #333;
  background-color: #fdfdfd;
  color: #444;
  line-height: 1.6;
`;

const footerStyle = `
  margin-top: 30px;
  font-size: 12px;
  color: #888;
  text-align: center;
`;

const getApprovalTemplate = (name) => `
  <div style="${baseStyle}">
    <h1 style="color: #000; font-size: 20px;">Welcome to ${process.env.SHOP_NAME}</h1>
    <p>Hi ${name},</p>
    <p>Great news! Your vendor application has been <strong>approved</strong>. You can now start listing your products and managing your store through the vendor dashboard.</p>
    <a href="${process.env.DASHBOARD_URL}" style="display:inline-block; padding: 10px 20px; background: #000; color: #fff; text-decoration: none; border-radius: 3px;">Go to Dashboard</a>
    <p>If you have questions, reply to this email.</p>
    <div style="${footerStyle}">© ${new Date().getFullYear()} ${process.env.SHOP_NAME}</div>
  </div>
`;

const getRejectionTemplate = (name) => `
  <div style="${baseStyle}">
    <h1 style="color: #000; font-size: 20px;">Update on your application</h1>
    <p>Hi ${name},</p>
    <p>Thank you for your interest in becoming a vendor at <strong>${process.env.SHOP_NAME}</strong>. We appreciate the time you took to apply.</p>
    <p>After carefully reviewing your application, we are sorry to inform you that we are unable to accept your request at this time. Our marketplace currently has specific requirements that your store profile does not meet.</p>
    <p>We encourage you to focus on your store growth and feel free to apply again in the future.</p>
    <p>Best regards,<br>The ${process.env.SHOP_NAME} Team</p>
    <div style="${footerStyle}">© ${new Date().getFullYear()} ${process.env.SHOP_NAME}</div>
  </div>
`;

const sendVendorStatusEmail = async (email, name, status) => {
  const html = status === 'approved' 
    ? getApprovalTemplate(name) 
    : getRejectionTemplate(name);
  
  const subject = status === 'approved' 
    ? "Welcome to our Marketplace!" 
    : "Update regarding your application";
    
  await sendEmail(email, subject, html);
};

module.exports = { sendVendorStatusEmail };