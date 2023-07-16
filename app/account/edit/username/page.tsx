import { cookies } from 'next/headers'
import { getJwt, getUserAttrFromToken } from '../../../api/util'
import { get, update } from '../../../../db/user'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export default async function Page() {
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
      const newToken = await getJwt(updatedUser.id!, updatedUser.name)
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
    <form action={updateUsername}>
      <h1 className="font-bold text-lg">Change username</h1>
      <div>
        <label className="label">
          <span className="label-text">Username *</span>
        </label>
        <div className="input-group">
          <input
            name="username"
            type="text"
            defaultValue={userName!}
            className="input input-bordered"
            required
          />
          <button type="submit" className="btn btn-square">
            Save
          </button>
        </div>
      </div>
    </form>
  )
}
