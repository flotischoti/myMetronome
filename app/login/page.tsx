import { Metadata } from 'next'
import { LoginForm } from './form'

export const metadata: Metadata = {
  title: 'Metronomes - Login',
}

export default function Page() {
  return <LoginForm />
}
