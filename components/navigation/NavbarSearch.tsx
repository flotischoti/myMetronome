'use client'

import { IconSearch } from '@tabler/icons-react'

export default function NavbarSearch() {
  return (
    <button
      className="btn btn-ghost"
      onClick={() => window.my_modal_2.showModal()}
    >
      <IconSearch />
    </button>
  )
}
