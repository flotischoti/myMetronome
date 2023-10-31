import React from 'react'

export default function ListLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div id="accountContainer" className="p-2">
      {children}
    </div>
  )
}
