'use client'

import Link from 'next/link'
import { useState, ChangeEvent, MouseEvent } from 'react'
import { StoredMetronome } from '../metronome/Metronome'

export default function SearchBox() {
  const [resultList, setResultList] = useState<StoredMetronome[]>([])
  const [searchValue, setSearchValue] = useState('')

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const search = e.target.value
    if (search.length > 2) {
      const matchingMetronomes: StoredMetronome[] = await fetch(
        `/api/users/1/metronomes?name=${search}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      ).then((res) => res.json())
      setResultList(matchingMetronomes)
    } else {
      setResultList([])
    }
    setSearchValue(search)
  }

  function handleMetronomeSelection(e: MouseEvent<HTMLLIElement>) {
    setResultList([])
    setSearchValue('')
  }

  return (
    <div id="searchContainer" className="p-1">
      <div id="searchBox">
        <input
          type="text"
          placeholder="Search Metronome"
          onChange={handleChange}
          className="w-full"
          value={searchValue}
        />
      </div>
      <div id="resultBox" className="max-w-xs">
        <ul>
          {resultList.map((r) => (
            <li id={'' + r.id} key={r.id} onClick={handleMetronomeSelection}>
              <Link href={`/metronome/${r.id}`}>
                {' '}
                {r.id} - {r.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}