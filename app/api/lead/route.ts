import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, email, role } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email required" }, { status: 400 });
    }

    console.log("Lead captured:", { name, email, role, timestamp: new Date().toISOString() });

    // Send notification email
    await resend.emails.send({
      from: "lucile.seal@coraglobalprojects.com",
      to: "lucile.seal@coraglobalprojects.com",
      subject: `New Kava Map Lead: ${name} (${role})`,
      html: `
        <h2>New Pacific Kava Map Lead</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Role:</strong> ${role}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p><strong>Source:</strong> Pacific Kava Interactive Map</p>
      `,
    });

    // Send confirmation to user
    await resend.emails.send({
      from: "lucile.seal@coraglobalprojects.com",
      to: email,
      subject: "Your Pacific Kava Market Report is on its way",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a1628; color: #e2e8f0; padding: 32px; border-radius: 12px;">
          <h1 style="color: #52B788;">Pacific Kava Market Report</h1>
          <p>Hi ${name},</p>
          <p>Thank you for your interest in the Pacific kava market. We'll be in touch shortly with the full market report covering:</p>
          <ul>
            <li>Global kava market overview ($130M and growing)</li>
            <li>Key producing nations and varieties</li>
            <li>Export opportunities and regulations</li>
            <li>USA kava bar market trends</li>
            <li>Smallholder farmer opportunities</li>
          </ul>
          <p style="margin-top: 24px;">In the meantime, explore our interactive kava map at <a href="https://pacific-kava-map.vercel.app" style="color: #52B788;">pacific-kava-map.vercel.app</a></p>
          <hr style="border-color: #1B4332; margin: 24px 0;" />
          <p style="font-size: 14px; color: #95D5B2;">CORA supports smallholder kava farmers in Vanuatu and PNG with soil health programs and carbon income. Learn more at <a href="https://coraprojects.com" style="color: #52B788;">coraprojects.com</a></p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead capture error:", error);
    // Still return success to not block the UX — log is captured above
    return NextResponse.json({ success: true, note: "logged" });
  }
}
