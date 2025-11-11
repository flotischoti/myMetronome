export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return Response.json({ status: 'ok' })
  } catch (e) {
    return Response.json({ status: 'error' }, { status: 500 })
  }
}
