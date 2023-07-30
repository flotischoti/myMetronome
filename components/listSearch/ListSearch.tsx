'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const ListSearch = ({ oldSearch }: { oldSearch: string }) => {
  const [searchValue, setSearchValue] = useState(oldSearch)
  const router = useRouter()

  return (
    <div id="searchContainer" className="join w-full">
      <input
        type="search"
        id="default-search"
        className="input input-bordered join-item w-full"
        placeholder="Search Metronomes"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') router.push(`/list?s=${searchValue}`)
        }}
        required
      />
      <Link
        href={`/list?s=${searchValue}`}
        prefetch={false}
        className="btn join-item"
      >
        Search
      </Link>
    </div>
  )
}

export default ListSearch
