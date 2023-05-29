export async function POST(request: Request) {
  return new Response(null, {
    status: 204,
    headers: {
      'Set-Cookie': `token=abc;path=/;secure; httpOnly; sameSite=Lax; expires=Thu, 01 Jan 1970 00:00:00 GMT`,
    },
  })
}
