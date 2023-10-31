'use client'

import { IconInfoCircle, IconX } from '@tabler/icons-react'
import Link from 'next/link'
import { useState } from 'react'

const LoginAlert = () => {
  const [showAlert, setShowAlert] = useState(true)

  return (
    <>
      {showAlert && (
        <div className="alert alert-info bottom-2 py-0.5 rounded-none w-full text-sm flex items-center px-2 justify-between">
          <span className="select-none flex items-center">
            <IconInfoCircle className="inline mr-1" />
            <Link href="/register" className="link">
              Sign up
            </Link>
            <span>&nbsp;or&nbsp;</span>
            <Link href="/login" className="link">
              login
            </Link>
            <span>&nbsp;to save metronomes</span>
          </span>
          <div className="flex items-center">
            <button
              className="btn btn-circle btn-xs btn-ghost"
              onClick={(e) => setShowAlert(false)}
            >
              <IconX />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default LoginAlert
