import { IconMoodSad } from '@tabler/icons-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-2">
      <IconMoodSad className="w-10 text-gray-400" />
      <h2 className="text-xl font-semibold">404 Not Found</h2>
      <p>Could not find the requested metronome.</p>
      <Link href="/" className="btn btn-primary">
        Go Back
      </Link>
    </main>
  )
}
