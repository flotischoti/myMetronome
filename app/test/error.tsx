'use client'

export default function E({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return <span>Custom Error Page: {error.message}</span>
}
