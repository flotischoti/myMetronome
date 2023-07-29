import ModalSearch from './modalSearch'

export default function Modal() {
  return (
    <dialog id="my_modal_2" className="modal modal-top">
      <form method="dialog" className="modal-box">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
          ✕
        </button>
        <h3 className="font-bold text-lg mb-2">Search your metronomes</h3>
        <ModalSearch />
      </form>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  )
}
