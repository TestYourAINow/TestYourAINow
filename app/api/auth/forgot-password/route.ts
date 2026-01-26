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
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); padding: 40px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Reset Your Password</h1>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 40px;">
                <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  Hello,
                </p>
                
                <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                  We received a request to reset your password for your TestYourAI account. Click the button below to create a new password:
                </p>
                
                <!-- Button -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding: 20px 0;">
                      <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        Reset Password
                      </a>
                    </td>
                  </tr>
                </table>
                
                <!-- Warning Box -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                  <tr>
                    <td style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px;">
                      <p style="color: #991b1b; font-size: 14px; margin: 0; line-height: 1.6;">
                        <strong>⚠️ Important:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>
                
                <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                  Best regards,<br>
                  The TestYourAI Team
                </p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} TestYourAI. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
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