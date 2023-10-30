import { cookies } from 'next/headers'
import { getJwt, getUserAttrFromToken } from '../../../api/util'
import { get, update } from '../../../../db/user'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

const Page = async () => {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  const userName = await getUserAttrFromToken<string>(token!.value, 'name')

  async function updateUsername(data: FormData) {
    'use server'
    const newUsername = data.get('username')!.toString()
    const user = await get(userName!)
    user!.name = newUsername

    const updatedUser = await update(user!)

    if (updatedUser && updatedUser.name == newUsername) {
      const newToken = await getJwt({
        userId: updatedUser.id!,
        name: updatedUser.name,
      })
      revalidatePath('/account')
      cookies().set({
        name: 'token',
        value: newToken,
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: true,
      })
      redirect('/account')
    }
  }

  return (
    <>
      <title>Metronomes - Edit name</title>
      <div>
        <div className="text-sm breadcrumbs ">
          <ul>
            <li>
              <Link href="/metronome/recent" prefetch={true}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/account" prefetch={true}>
                Account
              </Link>
            </li>
            <li>
              <Link href="/account/delete" prefetch={true}>
                Edit Username
              </Link>
            </li>
          </ul>
        </div>
        <form action={updateUsername}>
          <h1 className="font-bold text-lg">Change username</h1>
          <div>
            <label className="label">
              <span className="label-text">Username *</span>
            </label>
            <div className="join">
              <input
                name="username"
                type="text"
                maxLength={20}
                defaultValue={userName!}
                className="join-item input input-bordered"
                required
              />
              <button
                type="submit"
                className="btn join-item btn-square btn-neutral"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}

export default Page
