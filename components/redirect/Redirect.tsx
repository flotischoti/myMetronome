'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const Redirect = ({ path }: { path: string }) => {
  const router = useRouter()

  useEffect(() => router.push(path), [])

  return <div></div>
}

export default Redirect
