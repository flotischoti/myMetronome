import { IconCone2 } from '@tabler/icons-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Metronomes - Logo',
}

export default async function Page() {
  return (
    <div className="flex w-full justify-center h-full  items-center md:scale-125 lg:scale-150">
      <div className="md:scale-125 lg:scale-150">
        <div className="flex items-center gap-2 text-5xl lg:text-7xl">
          <IconCone2 size="64" className="hidden lg:block" />
          <IconCone2 size="48" className="lg:hidden" />
          <h1 className="font-cursive">Metronomes</h1>
        </div>
        <p className="text-end  text-xs  lg:text-md">
          Manage metronomes online for free
        </p>
      </div>
    </div>
  )
}
