'use server'
import { revalidatePath } from 'next/cache'

export async function serverAction(formData: FormData) {
  console.log(`Count Before: ${formData.get('count')}`)
  return Number(formData.get('count'))! + 1
}

export async function serverRevalidate() {
  console.log(`Revalidate`)
  revalidatePath('/list')
}
