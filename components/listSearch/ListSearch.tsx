'use client'

import { IconSearch } from '@tabler/icons-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const ListSearch = ({ oldSearch }: { oldSearch: string }) => {
  const [searchValue, setSearchValue] = useState(oldSearch)
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsSearching(false)
  }, [oldSearch])

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
      />
      <Link
        href={`/list?s=${searchValue}`}
        prefetch={false}
        className="btn join-item"
        onClick={() => {
          if (searchValue != oldSearch) setIsSearching(true)
        }}
      >
        {isSearching ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
          <IconSearch size="16" />
        )}
        Search
      </Link>
    </div>
  )
}

export default ListSearch
