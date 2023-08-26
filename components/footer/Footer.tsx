import {
  IconBrandInstagram,
  IconBrandGithub,
  IconCone2,
} from '@tabler/icons-react'

export default function Footer() {
  return (
    <footer className="footer items-center p-4 bg-neutral text-neutral-content">
      <div className="items-center grid-flow-col-dense">
        <IconCone2 />
        <p>My Metronome © 2023</p>
      </div>
      <div className="grid-flow-col-dense md:place-self-center md:justify-self-end">
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
