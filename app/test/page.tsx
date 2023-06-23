'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { serverAction, serverRevalidate } from './actions'
import { useState } from 'react'

export default function Page() {
  const router = useRouter()
  const [count, setCount] = useState(0)
  async function apiRevalidate() {
    await fetch(`/api/revalidate`, {
      cache: 'no-store',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // body: JSON.stringify({ path: '/test' }),
    })
    // router.push('/test')
  }

  return (
    <div>
      UNIX Client Local {Date.now()}
      <form>
        <button
          formAction={async (formData) => {
            const c = await serverAction(formData)
            setCount(c)
          }}
        >
          Increase
        </button>
        <button formAction={serverRevalidate}>Revalidate</button>
        <input type="text" name="count" defaultValue={count} value={count} />
      </form>
      <button onClick={apiRevalidate}>API Revalidate</button>
      <Link href="/test" prefetch={false}>
        LINK
      </Link>
    </div>
  )
}
