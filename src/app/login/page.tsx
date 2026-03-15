import { SignInButton } from '@/components/sign-in-button'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="rounded-2xl border border-border bg-card shadow-sm p-8 flex flex-col items-center gap-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="text-4xl">🎬</div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">BMS Notifier</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Know the second tickets drop
              </p>
            </div>
          </div>

          <div className="w-full flex flex-col gap-3">
            <SignInButton />
            <p className="text-xs text-muted-foreground">
              We only use your Google account to identify you.
            </p>
          </div>

          {/* How it works */}
          <div className="w-full border-t border-border pt-5 flex flex-col gap-3 text-left">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">How it works</p>
            {[
              { step: '1', text: 'Paste any BMS URL with your target date' },
              { step: '2', text: 'We check every 2 minutes automatically' },
              { step: '3', text: 'Get an email the instant tickets go live' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  {step}
                </span>
                <span className="text-sm text-muted-foreground">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
