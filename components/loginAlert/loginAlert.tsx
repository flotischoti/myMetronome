'use client'

import { IconInfoCircle, IconX } from '@tabler/icons-react'
import Link from 'next/link'
import { useState } from 'react'

const LoginAlert = () => {
  const [showAlert, setShowAlert] = useState(true)

  return (
    <>
      {showAlert && (
        <div className="alert alert-info absolute bottom-2 w-11/12 text-sm left-0 right-0 m-auto flex items-center px-3 opacity-95 justify-between">
          <span className="select-none">
            <IconInfoCircle className="inline mr-2" />
            <Link href="/register" className="link">
              Sign up
            </Link>
            <span>&nbsp;or&nbsp;</span>
            <Link href="/login" className="link">
              login
            </Link>
            <span>&nbsp;to save metronomes.</span>
          </span>
          <div>
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
