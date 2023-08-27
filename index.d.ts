import { JWTPayload } from 'jose'

declare module 'jose' {
  export interface JWTPayload {
    userId: number
    name: string
  }
}

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
  }
}
