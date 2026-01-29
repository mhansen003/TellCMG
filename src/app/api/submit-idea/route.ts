import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";

const RECIPIENT_EMAIL = "mhansen@cmgfi.com";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idea, categories, submitterEmail } = body;

    if (!idea || !idea.trim()) {
      return NextResponse.json({ error: "No idea content provided" }, { status: 400 });
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;

    if (!smtpUser || !smtpPassword) {
      console.error("SMTP credentials not configured");
      return NextResponse.json(
        { error: "Email service not configured. Please contact your administrator." },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    const categoryList = categories && categories.length > 0
      ? categories.map((c: string) =>
          c.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
        ).join(", ")
      : "General";

    const submitterLine = submitterEmail
      ? `<p style="font-size:14px;color:#64748b;margin:0 0 4px 0;">Submitted by: <strong style="color:#f0f4f8;">${submitterEmail}</strong></p>`
      : "";

    const subject = `TellCMG Idea Submission${submitterEmail ? ` from ${submitterEmail}` : ""} — ${categoryList}`;

    // Convert markdown-ish content to simple HTML
    const ideaHtml = idea
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/^### (.+)$/gm, '<h3 style="color:#9bc53d;font-size:16px;margin:16px 0 8px 0;font-weight:600;">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 style="color:#9bc53d;font-size:18px;margin:20px 0 10px 0;font-weight:700;border-bottom:1px solid rgba(155,197,61,0.3);padding-bottom:6px;">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 style="color:#f0f4f8;font-size:22px;margin:0 0 16px 0;font-weight:800;">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#f0f4f8;">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li style="margin:4px 0;color:#94a3b8;">$1</li>')
      .replace(/(<li.*<\/li>\n?)+/g, '<ul style="padding-left:20px;margin:8px 0;">$&</ul>')
      .replace(/\n\n/g, "</p><p style=\"color:#94a3b8;line-height:1.7;margin:10px 0;\">")
      .replace(/\n/g, "<br>");

    const htmlBody = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:700px;margin:0 auto;background:#1a2332;border-radius:12px;overflow:hidden;border:1px solid rgba(155,197,61,0.2);">
        <!-- Header -->
        <div style="background:#2b3e50;padding:24px 32px;border-bottom:3px solid #9bc53d;">
          <table style="width:100%;">
            <tr>
              <td>
                <span style="font-size:28px;font-weight:800;color:#9bc53d;letter-spacing:-0.5px;">CMG</span>
                <br>
                <span style="font-size:11px;font-weight:600;color:#64748b;letter-spacing:1px;text-transform:uppercase;">Financial</span>
              </td>
              <td style="text-align:right;">
                <span style="font-size:18px;font-weight:700;color:#f0f4f8;">TellCMG</span>
                <br>
                <span style="font-size:11px;color:#64748b;">Idea Submission</span>
              </td>
            </tr>
          </table>
        </div>

        <!-- Meta -->
        <div style="padding:20px 32px;background:#1f2b3d;border-bottom:1px solid rgba(148,163,184,0.1);">
          ${submitterLine}
          <p style="font-size:14px;color:#64748b;margin:0 0 4px 0;">Category: <strong style="color:#9bc53d;">${categoryList}</strong></p>
          <p style="font-size:12px;color:#64748b;margin:0;">Submitted: ${new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}</p>
        </div>

        <!-- Body -->
        <div style="padding:28px 32px;">
          <p style="color:#94a3b8;line-height:1.7;margin:0 0 10px 0;">
            ${ideaHtml}
          </p>
        </div>

        <!-- Footer -->
        <div style="padding:16px 32px;background:#1f2b3d;border-top:1px solid rgba(148,163,184,0.1);text-align:center;">
          <p style="font-size:11px;color:#64748b;margin:0;">
            Submitted via <strong style="color:#9bc53d;">TellCMG</strong> &mdash; Voice Your Ideas
          </p>
        </div>
      </div>
    `;

    const plainText = `TellCMG Idea Submission\n\n${submitterEmail ? "From: " + submitterEmail + "\n" : ""}Category: ${categoryList}\nDate: ${new Date().toLocaleString()}\n\n${idea}`;

    const mailOptions = {
      from: `"TellCMG" <${smtpUser}>`,
      to: RECIPIENT_EMAIL,
      subject,
      text: plainText,
      html: htmlBody,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Idea submitted successfully!" });
  } catch (error) {
    console.error("Submit idea error:", error);
    return NextResponse.json(
      { error: "Failed to submit idea. Please try again." },
      { status: 500 }
    );
  }
}
