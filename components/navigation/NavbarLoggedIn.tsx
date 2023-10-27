'use client'

import { IconMenu2, IconSearch } from '@tabler/icons-react'

export default function NavbarLoggedIn() {
  return (
    <>
      <button className="link" onClick={() => window.my_modal_2.showModal()}>
        <IconSearch />
      </button>
      <div>
        <label
          htmlFor="my-drawer"
          tabIndex={0}
          className="btn btn-ghost btn-circle  avatar drawer-button"
          onMouseUp={(e) => e.currentTarget.blur()}
        >
          <IconMenu2 />
        </label>
      </div>
    </>
  )
}
