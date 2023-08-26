import React from 'react'

export default function ListLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <section className="px-2">{children}</section>
}
