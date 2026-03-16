'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { LogOut } from 'lucide-react'

interface UserMenuProps {
  name?: string | null
  email?: string | null
  image?: string | null
}

export function UserMenu({ name, email, image }: UserMenuProps) {
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2.5">
        {image ? (
          <Image
            src={image}
            alt={name ?? 'User'}
            width={32}
            height={32}
            className="border border-border"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center border border-border bg-primary text-primary-foreground text-xs font-bold">
            {initials ?? '?'}
          </div>
        )}
        <div className="hidden sm:flex flex-col leading-tight">
          {name && <span className="text-sm font-semibold">{name}</span>}
          {email && <span className="text-xs text-muted-foreground">{email}</span>}
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="text-xs gap-1.5"
      >
        <LogOut className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Sign out</span>
      </Button>
    </div>
  )
}
