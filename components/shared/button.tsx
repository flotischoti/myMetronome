'use client'

import { MouseEvent } from 'react'
import { twMerge } from 'tailwind-merge'

export default function MainButton({
  children,
  onClick = () => {},
  className = '',
}: {
  children: React.ReactNode
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  className?: string
}) {
  const style = {
    mobile: ['px-4', 'text-400', 'py-2'],
    sm: ['sm:px-6', 'text-600'],
    font: ['uppercase', 'tracking-widest', 'text-white'],
    general: ['bg-violet-500'],
    hover: [
      'hover:bg-violet-600',
      'focus:outline-none',
      'focus:ring-0',
      'transition',
      'duration-150',
      'ease-in-out',
    ],
    border: ['rounded-full', 'border-2', 'border-orange-200'],
    shoadow: ['shadow-lg'],
    active: ['active:bg-violet-700'],
  }

  const classes = Object.values(style).flat().join(' ')

  return (
    <button className={twMerge(classes, className)} onClick={onClick}>
      {children}
    </button>
  )
}
