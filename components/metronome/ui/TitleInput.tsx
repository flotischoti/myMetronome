import { IconEdit } from '@tabler/icons-react'
import { useState, FocusEvent } from 'react'

export function TitleInput({
  name,
  locked,
  updateState,
}: {
  name: string
  locked: boolean
  updateState: (v: string) => void
}) {
  const [isEditTitle, setEditTitle] = useState(false)

  const editTitle = (e: FocusEvent<HTMLInputElement>) => {
    const newVal = e.target.value.trim()
    setEditTitle(false)
    updateState(newVal)
  }

  return (
    <div id="metronomeTitleArea-1" className="p-3 sm:p-4">
      {!isEditTitle ? (
        <div
          onClick={() => (!locked ? setEditTitle(true) : undefined)}
          className="flex items-center"
        >
          <h1 className="text-xl hover:cursor-text break-all">
            {name || 'Enter metronome title'}
          </h1>
          {!locked && (
            <span className="pl-2">
              <IconEdit size="16" className="hover:cursor-pointer" />
            </span>
          )}
        </div>
      ) : (
        <input
          type="text"
          defaultValue={name}
          placeholder="Enter metronome title"
          onBlur={editTitle}
          autoFocus
          className="input w-full input-ghost"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur()
              e.stopPropagation()
            }
          }}
        />
      )}
    </div>
  )
}
