export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let res = await fetch('http://worldtimeapi.org/api/timezone/Europe/Berlin', {
    // cache: 'no-store',
  })
  let body = await res.json()
  let date = body.unixtime
  console.log(date)
  let date2 = Date.now()
  return (
    <div>
      <div>UNIX Server Fetch: {date}</div>
      <div>UNIX Server Local: {date2} </div>
      {children}
    </div>
  )
}
