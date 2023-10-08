import { JWTPayload } from 'jose'
import React, { FormHTMLAttributes, CSSProperties } from 'react'

declare module 'jose' {
  export interface JWTPayload {
    userId: number
    name: string
  }
}

declare module 'react' {
  export interface FormHTMLAttributes {
    action?: number | string | undefined
  }
  export interface CSSProperties {
    '--value': string
  }
}

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
    my_modal_2: HTMLDialogElement
  }
}
