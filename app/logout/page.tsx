'use client'

import { useState, useEffect } from 'react'
import { logoutServerAction } from '../actions'

export default function Page() {
  const [error, setError] = useState(false)

  useEffect(() => {
    logoutServerAction()
    setError(true)
  }, [])

  return (
    <>
      <title>Metronomes - Logout</title>
      <div>
        {error ? <span>Logging out...</span> : <span>Error logging out</span>}
      </div>
    </>
  )
}
