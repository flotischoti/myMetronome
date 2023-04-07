'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default async function Page() {
  const router = useRouter()

  useEffect(() => router.push('/metronome/'), [])

  return <></>
}
