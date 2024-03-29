import React from 'react'

export default function ListLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <section className="max-w-xl mx-auto py-1">{children}</section>
}
