import { StoredMetronome } from '../metronome/Metronome'
import ModalSearch from './modalSearch'

export default function Modal({
  recentCount,
  recentMetronomes,
}: {
  recentCount: number
  recentMetronomes: StoredMetronome[]
}) {
  return (
    <dialog id="my_modal_2" className="modal modal-top ">
      <form method="dialog" className="modal-box max-w-lg mx-auto">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
          ✕
        </button>
        <h3 className="font-bold text-lg mb-2">Search your metronomes</h3>
        <ModalSearch
          recentCount={recentCount}
          recentMetronomes={recentMetronomes}
        />
      </form>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  )
}
