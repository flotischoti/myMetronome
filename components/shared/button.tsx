'use client'

import { MouseEvent } from 'react'
import { twMerge } from 'tailwind-merge'

export default function MainButton({
  children,
  onClick = () => {},
  onMouseDown = () => {},
  onMouseUp = () => {},
  onMouseLeave = () => {},
  className = '',
}: {
  children: React.ReactNode
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  onMouseDown?: (e: MouseEvent<HTMLButtonElement>) => void
  onMouseUp?: (e: MouseEvent<HTMLButtonElement>) => void
  onMouseLeave?: (e: MouseEvent<HTMLButtonElement>) => void
  className?: string
}) {
  const style = {
    mobile: ['px-4', 'text-400', 'py-2'],
    sm: ['sm:px-6', 'text-600'],
    font: ['uppercase', 'tracking-widest', 'text-gray-600'],
    general: ['bg-zinc-100'],
    hover: [
      'hover:bg-zinc-200',
      'focus:outline-none',
      'focus:ring-0',
      'transition',
      'duration-150',
      'ease-in-out',
    ],
    border: ['rounded-full', 'border-2', 'border-orange-200'],
    shoadow: ['shadow-lg'],
    active: ['active:bg-zinc-300'],
  }

  const classes = Object.values(style).flat().join(' ')

  return (
    <button
      className={twMerge(classes, className)}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </button>
  )
}
