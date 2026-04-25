const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendApprovalEmail = async (email, role, password) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Account Approved ✅",
      html: `
        <h2>Account Approved 🎉</h2>
        <p>Your account has been approved as <b>${role}</b> on PharmaConnect.</p>
        <p><b>Email:</b> ${email}</p>
        <p>You can now login using the password you set during registration.</p>
        <br/>
        <p>You can now login at PharmaConnect 🚀</p>
      `,
    });
    console.log("✅ Email Sent Successfully");
  } catch (error) {
    console.log("❌ Email Error:", error);
  }
};

module.exports = sendApprovalEmail;
