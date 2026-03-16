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
    from: `"FDFS — First Day First Show" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Tickets are LIVE — Book now before they fill up!',
    html: `
      <div style="font-family:monospace;max-width:520px;margin:0 auto;border:2px solid #000;">
        <div style="background:#ff3333;padding:16px 24px;">
          <span style="color:#fff;font-weight:700;font-size:14px;letter-spacing:4px;text-transform:uppercase;">FDFS</span>
        </div>
        <div style="padding:28px 24px;background:#ffffff;border-bottom:2px solid #000;">
          <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#000;">Tickets just dropped!</h2>
          <p style="color:#333333;margin:0 0 24px;font-size:14px;">
            The show you were monitoring is now available on BookMyShow. Seats go fast!
          </p>
          <a
            href="${url}"
            style="display:inline-block;padding:12px 28px;background:#ff3333;color:#fff;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:1px;text-transform:uppercase;border:2px solid #000;box-shadow:4px 4px 0 #000;"
          >
            Book Now
          </a>
        </div>
        <div style="padding:12px 24px;background:#f0f0f0;">
          <p style="color:#333333;font-size:11px;margin:0;">
            This monitor has been stopped. You can create a new one at fdfs.app at any time.
          </p>
        </div>
      </div>
    `,
  })
}
