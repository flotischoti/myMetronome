import { PrismaClient } from '@prisma/client'
import { JWTPayload } from 'jose'
import React, { FormHTMLAttributes, CSSProperties } from 'react'
import 'react-dom'

declare module 'jose' {
  export interface JWTPayload {
    userId: number
    name: string
    email?: string
  }
}

declare module 'react' {
  export interface CSSProperties {
    '--value'?: string
  }
}

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
    my_modal_2: HTMLDialogElement
  }
  var prisma: PrismaClient
}
