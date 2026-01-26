// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Trouver l'utilisateur
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // ⚠️ SÉCURITÉ: Ne jamais révéler si l'email existe ou non
    // Toujours retourner le même message
    if (!user) {
      return NextResponse.json({
        message: "If that email exists, a reset link has been sent."
      });
    }

    // Générer un token unique et sécurisé
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    // Sauvegarder le token dans la DB
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    // Créer le lien de reset
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${resetToken}`;

    // Envoyer l'email avec Resend
    try {
      await resend.emails.send({
        from: "TestYourAI Now <noreply@noreply.testyourainow.com>",
        to: email,
        subject: "Reset Your Password - TestYourAI Now",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0b; margin: 0; padding: 0;">
              <div style="max-width: 600px; margin: 40px auto; background: linear-gradient(135deg, #111827 0%, #1f2937 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                
                <!-- Header -->
                <div style="background: linear-gradient(to right, #3b82f6, #06b6d4); padding: 32px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Reset Your Password</h1>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px 32px;">
                  <p style="color: #e5e7eb; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                    Hello,
                  </p>
                  
                  <p style="color: #e5e7eb; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                    We received a request to reset your password for your TestYourAI account. Click the button below to create a new password:
                  </p>
                  
                  <!-- Reset Button -->
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(to right, #3b82f6, #06b6d4); color: white; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                      Reset Password
                    </a>
                  </div>
                  
                  <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                    Or copy and paste this link into your browser:
                  </p>
                  
                  <p style="color: #3b82f6; font-size: 14px; word-break: break-all; background: #1f2937; padding: 12px; border-radius: 8px; margin: 8px 0 24px 0;">
                    ${resetUrl}
                  </p>
                  
                  <!-- Warning Box -->
                  <div style="background: #7f1d1d; border-left: 4px solid #ef4444; padding: 16px; border-radius: 8px; margin: 24px 0;">
                    <p style="color: #fca5a5; font-size: 14px; margin: 0; line-height: 1.6;">
                      ⚠️ <strong>Important:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
                    </p>
                  </div>
                  
                  <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                    Best regards,<br>
                    The TestYourAI Team
                  </p>
                </div>
                
                <!-- Footer -->
                <div style="background: #0a0a0b; padding: 24px 32px; text-align: center; border-top: 1px solid #374151;">
                  <p style="color: #6b7280; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} TestYourAI. All rights reserved.
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      console.log(`✅ Password reset email sent to ${email}`);
    } catch (emailError) {
      console.error("❌ Resend email error:", emailError);
      return NextResponse.json(
        { error: "Failed to send reset email. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "If that email exists, a reset link has been sent."
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}