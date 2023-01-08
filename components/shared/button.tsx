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
    mobile: ['px-4', 'text-blue-400', 'py-2'],
    sm: ['sm:px-6', 'text-blue-600'],
    font: ['uppercase', 'tracking-widest'],
    hover: [
      'hover:bg-black',
      'hover:bg-opacity-5',
      'focus:outline-none',
      'focus:ring-0',
      'transition',
      'duration-150',
      'ease-in-out',
    ],
    border: ['rounded-full', 'border-2', 'border-orange-200'],
    shoadow: ['shadow-lg'],
  }

  const classes = Object.values(style).flat().join(' ')

  return (
    <button className={twMerge(classes, className)} onClick={onClick}>
      {children}
    </button>
  )
}
