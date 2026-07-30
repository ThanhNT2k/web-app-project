const { Resend } = require('resend');
const env = require('../config/environment');

let resend = null;
const isResendConfigured = env.RESEND_API_KEY && 
                           env.RESEND_API_KEY !== 'your_api_key_here' && 
                           !env.RESEND_API_KEY.includes('xxxx');

if (isResendConfigured) {
  try {
    resend = new Resend(env.RESEND_API_KEY);
  } catch (err) {
    console.error('[EmailService] Failed to initialize Resend client:', err.message);
  }
}


/**
 * Gửi email chứa mã OTP để đặt lại mật khẩu.
 * Template HTML được thiết kế rõ ràng, nhận diện thương hiệu CMC Truyện.
 *
 * @param {string} to - Email người nhận
 * @param {string} otp - Mã OTP 6 chữ số
 */
async function sendOtpEmail(to, otp) {
  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Đặt lại mật khẩu — CMC Truyện</title>
    </head>
    <body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',system-ui,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="480" cellpadding="0" cellspacing="0"
              style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.1);max-width:90vw;">

              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#3c6ad3,#2d5aa8);padding:28px 32px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:1.5rem;font-weight:700;letter-spacing:-0.5px;">
                    📖 CMC Truyện
                  </h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:32px;">
                  <h2 style="margin:0 0 8px;font-size:1.25rem;color:#111827;">Đặt lại mật khẩu</h2>
                  <p style="margin:0 0 24px;color:#6b7280;line-height:1.6;">
                    Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với email này.
                    Sử dụng mã OTP bên dưới để tiếp tục. Mã có hiệu lực trong <strong>5 phút</strong>.
                  </p>

                  <!-- OTP Box -->
                  <div style="text-align:center;margin:24px 0;">
                    <div style="
                      display:inline-block;
                      background:#f0f4ff;
                      border:2px dashed #3c6ad3;
                      border-radius:12px;
                      padding:20px 40px;
                    ">
                      <p style="margin:0 0 4px;font-size:0.8rem;color:#6b7280;letter-spacing:1px;text-transform:uppercase;">
                        Mã xác nhận
                      </p>
                      <p style="margin:0;font-size:2.5rem;font-weight:700;color:#3c6ad3;letter-spacing:8px;">
                        ${otp}
                      </p>
                    </div>
                  </div>

                  <p style="margin:0 0 8px;color:#6b7280;font-size:0.9rem;line-height:1.6;">
                    Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
                    Tài khoản của bạn vẫn an toàn.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
                  <p style="margin:0;color:#9ca3af;font-size:0.8rem;">
                    Email này được gửi tự động từ CMC Truyện. Vui lòng không trả lời.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (!resend) {
    console.warn('[EmailService] Resend is not configured. Falling back to console log.');
    console.log('\n==================================================');
    console.log(`[DEVELOPMENT OTP BYPASS]`);
    console.log(`To: ${to}`);
    console.log(`OTP Code: ${otp}`);
    console.log('==================================================\n');
    return;
  }

  const result = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: `[CMC Truyện] Mã OTP đặt lại mật khẩu: ${otp}`,
    html,
  });

  if (result?.error) {
    throw new Error(`Resend rejected the OTP email: ${result.error.message || 'Unknown error'}`);
  }

  return result?.data;
}

module.exports = { sendOtpEmail };
