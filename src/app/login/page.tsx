import { SignInButton } from '@/components/sign-in-button'
import { Ticket, Clock, Bell } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Header bar */}
        <div className="border border-border bg-primary px-5 py-3 flex items-center gap-3 shadow">
          <Ticket className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          <span className="font-bold text-primary-foreground tracking-widest text-sm uppercase font-mono">
            BMS Notifier
          </span>
        </div>

        {/* Main card */}
        <div className="border border-t-0 border-border bg-card shadow-md p-7 flex flex-col gap-7">
          <div>
            <h1 className="text-2xl font-bold tracking-tight leading-snug">
              Know the second<br />tickets drop.
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Automatic BMS availability monitoring — no refresh needed.
            </p>
          </div>

          {/* How it works */}
          <div className="flex flex-col gap-3">
            {[
              { Icon: Ticket, text: 'Paste any BMS URL with your target date' },
              { Icon: Clock,  text: 'We check every 2 minutes automatically' },
              { Icon: Bell,   text: 'Get an email the instant tickets go live' },
            ].map(({ Icon, text }, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center border border-border bg-secondary shadow-xs">
                  <span className="text-xs font-bold font-mono">{i + 1}</span>
                </div>
                <div className="flex items-start gap-2 pt-0.5">
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground mt-px" />
                  <span className="text-sm">{text}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Sign in */}
          <div className="flex flex-col gap-2">
            <SignInButton />
            <p className="text-xs text-muted-foreground text-center">
              We only use your Google account to identify you.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
