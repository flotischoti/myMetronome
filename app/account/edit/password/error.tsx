'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div>
      <h1 className="font-bold text-lg">Changing password failed</h1>
      <p>
        The old password might have been incorrect or a technical error occured.
      </p>
      <p
        className="link"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </p>
    </div>
  )
}
