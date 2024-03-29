import {
  IconBrandGithub,
  IconBrandGithubCopilot,
  IconBrandGithubFilled,
  IconBrandInstagram,
  IconCone2,
  IconMail,
} from '@tabler/icons-react'
import Link from 'next/link'

export const Footer = () => {
  return (
    <footer className="footer select-none z-100 items-center p-4 text-xs sm:text-sm bg-neutral text-neutral-content dark:bg-base-200 dark:text-base-content shadow">
      <nav className="flex items-center w-full justify-between">
        <div className="flex items-center gap-2 wrap">
          <IconCone2 size="20" className="sm:hidden" />
          <IconCone2 size="28" className="hidden sm:block" />
          <p className="font-semibold">Metronomes </p>
          <Link href="/privacy" className="pl-2">
            Privacy Policy
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            target="_blank"
            href="mailto:hello@metronomes.xyz"
            className="link"
          >
            <IconMail size="28" className="hidden sm:block" />
            <IconMail size="20" className="sm:hidden" />
          </a>
          <a
            target="_blank"
            href="https://www.instagram.com/flotischoti/"
            className="link"
          >
            <IconBrandInstagram size="28" className="hidden sm:block" />
            <IconBrandInstagram size="20" className="sm:hidden" />
          </a>
          <a
            target="_blank"
            href="https://github.com/flotischoti/myMetronome"
            className="link"
          >
            <IconBrandGithub size="24" className="hidden sm:block" />
            <IconBrandGithub size="19" className="sm:hidden" />
          </a>
        </div>
      </nav>
    </footer>
  )
}
