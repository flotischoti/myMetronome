import { Metadata } from 'next'
import { SignUpForm } from './form'

export const metadata: Metadata = {
  title: 'Metronomes - Sign Up',
}

export default function Page() {
  return <SignUpForm />
}
