import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendAvailabilityEmail(to: string, url: string): Promise<void> {
  await transporter.sendMail({
    from: `"BMS Notifier" <${process.env.GMAIL_USER}>`,
    to,
    subject: '🎬 Tickets are LIVE — Book now before they fill up!',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#09090b;color:#fafafa;border-radius:12px;">
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;">🎉 Tickets just dropped!</h2>
        <p style="color:#a1a1aa;margin:0 0 28px;font-size:15px;">
          The show you were monitoring is now available on BookMyShow. Seats go fast!
        </p>
        <a
          href="${url}"
          style="display:inline-block;padding:14px 32px;background:#e51937;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;"
        >
          Book Now →
        </a>
        <hr style="border:none;border-top:1px solid #27272a;margin:32px 0 16px;" />
        <p style="color:#52525b;font-size:12px;margin:0;">
          This monitor has been stopped. You can create a new one at any time.
        </p>
      </div>
    `,
  })
}
