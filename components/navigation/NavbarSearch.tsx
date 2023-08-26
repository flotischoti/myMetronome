'use client'

import { IconSearch } from '@tabler/icons-react'

export default function NavbarSearch() {
  return (
    <button className="link" onClick={() => window.my_modal_2.showModal()}>
      <IconSearch />
    </button>
  )
}
