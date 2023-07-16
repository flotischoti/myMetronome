'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  const router = useRouter()
  useEffect(() => {
    setTimeout(() => router.push('/metronome/recent'), 2000)
  }, [error])

  return (
    <div>
      <h1 className="font-bold text-lg">Loading Metronome failed</h1>
      <p>
        You might not have access to open the metronome, the metronome might not
        exists or a technical error occured
      </p>
      <p>Redirecting...</p>
    </div>
  )
}
