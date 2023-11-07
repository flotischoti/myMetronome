import {
  IconBrandGithub,
  IconBrandInstagram,
  IconCone2,
} from '@tabler/icons-react'
import Link from 'next/link'

export const Footer = () => {
  return (
    <footer className="footer items-center p-4 bg-neutral text-neutral-content">
      <nav className="flex items-center w-full justify-between">
        <div className="flex items-center gap-2 wrap">
          <IconCone2 size="32" />
          <p>Metronomes </p>
          <Link href="/privacy" className="pl-2">
            Privacy Policy
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <a
            target="_blank"
            href="https://www.instagram.com/flotischoti/"
            className="link"
          >
            <IconBrandInstagram />
          </a>
          <a
            target="_blank"
            href="https://github.com/flotischoti"
            className="link"
          >
            <IconBrandGithub />
          </a>
        </div>
      </nav>
    </footer>
  )
}
