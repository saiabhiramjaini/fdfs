'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

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
            width={34}
            height={34}
            className="rounded-full ring-2 ring-border"
          />
        ) : (
          <div className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold ring-2 ring-border">
            {initials ?? '?'}
          </div>
        )}
        <div className="hidden sm:flex flex-col leading-tight">
          {name && <span className="text-sm font-medium">{name}</span>}
          {email && <span className="text-xs text-muted-foreground">{email}</span>}
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="text-xs"
      >
        Sign out
      </Button>
    </div>
  )
}
