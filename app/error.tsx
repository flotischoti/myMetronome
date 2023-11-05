'use client' // Error components must be Client components

import { IconMoodSad } from '@tabler/icons-react'
import Link from 'next/link'
import { useEffect } from 'react'

const Error = ({ error, reset }: { error: Error; reset: () => void }) => {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <IconMoodSad size="48" />
      <h2 className="pb-4">Something went wrong!</h2>
      <button className="btn btn-warning inline" onClick={() => reset()}>
        Try again
      </button>
      <Link href="/" className="link mt-4">
        return to homepage
      </Link>
    </div>
  )
}

export default Error
