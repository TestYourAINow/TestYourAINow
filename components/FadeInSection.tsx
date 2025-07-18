'use client'
import { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
}

export default function FadeInSection({ children, className = '' }: Props) {
  return (
    <div className={`opacity-0 animate-slide-up-fade ${className}`}>
      {children}
    </div>
  )
}
