'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const [error, setError] = useState(null as unknown as string)
  const router = useRouter()

  useEffect(() => {
    logout()
  }, [])

  async function logout() {
    const response = await fetch(`/api/auth/logout/`, {
      method: 'POST',
    })
    console.log(response.status)

    if (response.status != 204) {
      setError(response.statusText)
      return
    }

    router.push(`/metronome/new`)
  }

  return (
    <div>
      {error ? <span>Error logging out</span> : <span>Logging out...</span>}
    </div>
  )
}
