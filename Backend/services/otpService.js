const { getRedisClient } = require("./redisClient");

const OTP_EXPIRY_SECONDS = 10 * 60;
const OTP_RESEND_COOLDOWN_SECONDS = 60;

const normalizeEmail = (email) => email.trim().toLowerCase();

const buildOtpKey = (email) => `auth:otp:${normalizeEmail(email)}`;
const buildCooldownKey = (email) => `auth:otp-cooldown:${normalizeEmail(email)}`;

const setOtpRecord = async (email, otp) => {
  const client = await getRedisClient();
  const otpKey = buildOtpKey(email);
  const cooldownKey = buildCooldownKey(email);

  await Promise.all([
    client.set(otpKey, otp, { EX: OTP_EXPIRY_SECONDS }),
    client.set(cooldownKey, "1", { EX: OTP_RESEND_COOLDOWN_SECONDS }),
  ]);
};

const getOtpRecord = async (email) => {
  const client = await getRedisClient();
  return client.get(buildOtpKey(email));
};

const clearOtpRecord = async (email) => {
  const client = await getRedisClient();
  await Promise.all([
    client.del(buildOtpKey(email)),
    client.del(buildCooldownKey(email)),
  ]);
};

const getResendCooldown = async (email) => {
  const client = await getRedisClient();
  const ttl = await client.ttl(buildCooldownKey(email));

  if (ttl <= 0) {
    return {
      canResend: true,
      retryAfterSeconds: 0,
    };
  }

  return {
    canResend: false,
    retryAfterSeconds: ttl,
  };
};

module.exports = {
  OTP_EXPIRY_SECONDS,
  OTP_RESEND_COOLDOWN_SECONDS,
  clearOtpRecord,
  getOtpRecord,
  getResendCooldown,
  setOtpRecord,
};
