const axios = require("axios");

const sendEmail = async (options) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL;

  if (!apiKey || !senderEmail) {
    console.error("Brevo email configuration is missing in .env");
    throw new Error("Email configuration missing");
  }

  const payload = {
    sender: {
      name: "RateRight",
      email: senderEmail,
    },
    to: [{ email: options.email }],
    subject: options.subject,
    htmlContent: options.html,
  };

  try {
    await axios.post("https://api.brevo.com/v3/smtp/email", payload, {
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
    });

    return true;
  } catch (error) {
    const errorBody = error.response?.data;

    if (errorBody) {
      console.error("Brevo error:", JSON.stringify(errorBody, null, 2));
    }

    console.error("Email system error:", error.message);
    throw new Error(
      errorBody?.message || "Unable to send verification email right now"
    );
  }
};

const sendOTPEmail = async (email, otp, fullName = "there") => {
  const safeName = fullName.trim() || "there";

  await sendEmail({
    email,
    subject: "Verify your RateRight account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 20px; overflow: hidden;">
        <div style="padding: 32px; background: linear-gradient(135deg, #0f766e, #1d4ed8);">
          <p style="margin: 0; font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: rgba(255,255,255,0.75);">RateRight</p>
          <h1 style="margin: 12px 0 0; font-size: 28px; color: #ffffff;">Verify your email</h1>
        </div>
        <div style="padding: 32px;">
          <p style="margin: 0 0 16px; font-size: 16px;">Hi ${safeName},</p>
          <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.7; color: #cbd5e1;">
            Use the 6-digit code below to verify your RateRight account. This OTP expires in 10 minutes.
          </p>
          <div style="margin: 24px 0; padding: 18px 20px; border-radius: 16px; background: #020617; border: 1px solid rgba(148, 163, 184, 0.2); text-align: center;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 0.35em; color: #5eead4;">${otp}</span>
          </div>
          <p style="margin: 0; font-size: 13px; line-height: 1.7; color: #94a3b8;">
            If you did not create this account, you can ignore this email.
          </p>
        </div>
      </div>
    `,
  });
};

module.exports = {
  sendEmail,
  sendOTPEmail,
};
