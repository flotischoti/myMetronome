import { PrismaClient } from '@prisma/client'
import { JWTPayload } from 'jose'
import React, { FormHTMLAttributes, CSSProperties } from 'react'
import 'react-dom'

declare module 'jose' {
  export interface JWTPayload {
    userId: number
    name: string
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

import 'react-dom'

declare module 'react-dom' {
  function experimental_useFormState<State>(
    action: (state: State) => Promise<State>,
    initialState: State,
    permalink?: string
  ): [state: State, dispatch: () => void]
  function experimental_useFormState<State, Payload>(
    action: (state: State, payload: Payload) => Promise<State>,
    initialState: State,
    permalink?: string
  ): [state: State, dispatch: (payload: Payload) => void]
  function experimental_useFormStatus(): { pending: string }
}
