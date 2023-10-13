'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, ChangeEvent, MouseEvent, useRef } from 'react'
import { StoredMetronome } from '../metronome/Metronome'

const ModalSearch = ({
  recentCount,
  recentMetronomes,
}: {
  recentCount: number
  recentMetronomes: StoredMetronome[]
}) => {
  const [resultList, setResultList] =
    useState<StoredMetronome[]>(recentMetronomes)
  const [searchValue, setSearchValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [count, setCount] = useState(recentCount)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )
  const router = useRouter()

  async function search(searchString: string) {
    const {
      metronomes,
      count,
    }: { metronomes: StoredMetronome[]; count: number } = await fetch(
      `/api/metronomes?name=${searchString}&top=5`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    ).then((res) => res.json())
    setResultList(metronomes)
    setCount(count)
    setIsLoading(false)
  }

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    clearTimeout(searchTimer.current)
    const searchString = e.target.value
    setSearchValue(searchString)
    setResultList([])
    setCount(0)
    if (searchString.length > 2) {
      setIsLoading(true)
      searchTimer.current = setTimeout(() => {
        search(searchString)
      }, 300)
    } else {
      if (searchString.length == 0) {
        setResultList(recentMetronomes)
      }
      setIsLoading(false)
    }
  }

  function handleMetronomeSelection(e: MouseEvent<HTMLLIElement>) {
    setSearchValue('')
    setResultList(recentMetronomes)
    setCount(recentCount)
    window.my_modal_2.close()
  }

  return (
    <div id="searchContainer" className="p-1">
      <div id="searchBox" className="join join-horizontal w-full">
        <input
          type="text"
          placeholder="Start typing..."
          onChange={handleChange}
          className="input input-bordered join-item w-full"
          value={searchValue}
          onKeyDown={(e) => {
            if (e.key === 'Enter') router.push(`/list?s=${searchValue}`)
          }}
        />
        <Link
          href={`/list?s=${searchValue}`}
          className="btn join-item"
          onClick={() => window.my_modal_2.close()}
        >
          Search
        </Link>
      </div>
      <div id="resultBox">
        {recentMetronomes.length == 0 ? (
          <div className="mt-4">
            <span>You don&apos;t have any metronomes yet. </span>
            <Link
              href="/metronome/new"
              prefetch={true}
              className="link"
              onClick={() => window.my_modal_2.close()}
            >
              Create one?
            </Link>
          </div>
        ) : (
          <>
            {isLoading && (
              <span className="loading loading-dots loading-lg mt-8"></span>
            )}
            {resultList.length == 0 && searchValue.length > 2 && !isLoading && (
              <div className="mt-4">
                <span>No metronomes found. Change search or </span>
                <Link
                  href="/metronome/new"
                  prefetch={true}
                  className="link"
                  onClick={() => window.my_modal_2.close()}
                >
                  create one?
                </Link>
              </div>
            )}
            <ul className="w-full">
              {resultList.map((r) => (
                <li
                  id={'' + r.id}
                  key={r.id}
                  onClick={handleMetronomeSelection}
                  className="bg-slate-50 hover:bg-slate-100 rounded-lg w-full p-2 pl-4"
                >
                  <div>
                    <Link
                      href={`/metronome/${r.id}`}
                      prefetch={true}
                      className="flex flex-col"
                    >
                      <span className="font-bold underline ">{r.name}</span>
                      <span>BPM: {r.bpm}</span>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>

            {searchValue.length > 2 && count > 5 && (
              <span className="text-xs mt-2">
                Showing first 5 out of {count} matches. Try narrowing down the
                search.
              </span>
            )}
            {searchValue.length == 0 && count > 0 && (
              <span className="text-xs mt-2">
                Showing {Math.min(5, count)} last recently used metronomes.
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ModalSearch
