import {
  IconBrandInstagram,
  IconBrandGithub,
  IconCone2,
} from '@tabler/icons-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer items-center p-4 bg-neutral text-neutral-content">
      <div className="items-center grid-flow-col">
        <IconCone2 />
        <p>Copyright © 2023 - All right reserved</p>
      </div>
      <div className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
        <a
          target="_blank"
          href="https://www.instagram.com/flotischoti/"
          className="btn btn-ghost"
        >
          <IconBrandInstagram />
        </a>
        <a
          target="_blank"
          href="https://github.com/flotischoti"
          className="btn btn-ghost"
        >
          <IconBrandGithub />
        </a>
      </div>
    </footer>
  )
}
