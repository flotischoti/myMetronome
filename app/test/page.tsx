export default function Page() {
  async function test() {
    'use server'

    throw new Error(`Server Action Failed :(`)

    return 'test'
  }

  return (
    <form action={test}>
      <button type="submit" className="btn">
        Submit
      </button>
    </form>
  )
}
