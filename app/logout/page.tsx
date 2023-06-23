'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { logoutServerAction } from '../actions'

export default function Page() {
  const [error, setError] = useState(null as unknown as string)
  const router = useRouter()

  useEffect(() => {
    logout()
  }, [])

  async function logout() {
    const response = await fetch(`/api/auth/logout`, {
      method: 'POST',
    })

    if (response.status != 204) {
      setError(response.statusText)
      return
    }

    // await fetch(`/api/revalidate`, {
    //   cache: 'no-store',
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ path: '/' }),
    // })

    router.refresh()
    router.push(`/`)
  }

  return (
    <div>
      {error ? <span>Error logging out</span> : <span>Logging out...</span>}
    </div>
  )
}
