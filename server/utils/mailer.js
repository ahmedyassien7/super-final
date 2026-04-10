/**
 * utils/mailer.js
 * Email sending utility using Nodemailer.
 *
 * Uses Ethereal (free test SMTP) by default — creates a temp account
 * automatically so emails work out of the box. You can view sent emails
 * via the preview URL logged to the console.
 *
 * To use Gmail instead, set these in .env:
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=587
 *   SMTP_USER=your-email@gmail.com
 *   SMTP_PASS=your-app-password
 *   SMTP_FROM=your-email@gmail.com
 */

const nodemailer = require("nodemailer");

let transporterPromise = null;

/**
 * Get or create the SMTP transporter.
 * If SMTP_HOST is set in .env, uses those settings.
 * Otherwise auto-creates an Ethereal test account.
 */
async function getTransporter() {
    if (transporterPromise) return transporterPromise;

    transporterPromise = (async () => {
        if (process.env.SMTP_HOST) {
            // Use configured SMTP (Gmail, Outlook, etc.)
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT, 10) || 587,
                secure: process.env.SMTP_SECURE === "true",
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
            console.log("📧 Using configured SMTP:", process.env.SMTP_HOST);
            return transporter;
        }

        // Fallback: create an Ethereal test account (free, no signup needed)
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log("📧 Using Ethereal test account:", testAccount.user);
        return transporter;
    })();

    return transporterPromise;
}

/**
 * Send a password reset email.
 * @param {string} toEmail  — recipient email
 * @param {string} resetLink — full URL with token
 * @returns {object} — { success, previewUrl }
 */
async function sendResetEmail(toEmail, resetLink) {
    const transporter = await getTransporter();
    const fromAddress = process.env.SMTP_FROM || "Supermarket <no-reply@supermarket.com>";

    const info = await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: "🔐 Password Reset — Supermarket",
        text: `You requested a password reset.\n\nClick this link to reset your password:\n${resetLink}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, ignore this email.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #27ae60, #2ecc71); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">🛒 Supermarket</h1>
                </div>
                <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
                    <h2 style="color: #2c3e50; margin-top: 0;">Password Reset Request</h2>
                    <p style="color: #555; line-height: 1.6;">
                        We received a request to reset the password for your account 
                        (<strong>${toEmail}</strong>).
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" 
                           style="background: #27ae60; color: white; padding: 14px 32px; 
                                  border-radius: 8px; text-decoration: none; font-weight: bold;
                                  font-size: 16px; display: inline-block;">
                            Reset My Password
                        </a>
                    </div>
                    <p style="color: #888; font-size: 13px; line-height: 1.5;">
                        This link will expire in <strong>1 hour</strong>.<br>
                        If you didn't request a password reset, you can safely ignore this email.
                    </p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #aaa; font-size: 12px; text-align: center;">
                        © 2026 Supermarket. All rights reserved.
                    </p>
                </div>
            </div>
        `,
    });

    // For Ethereal, generate preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);

    return { success: true, messageId: info.messageId, previewUrl };
}

module.exports = { sendResetEmail };
