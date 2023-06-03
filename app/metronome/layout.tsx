import SearchBox from '../../components/searchbox/searchbox'

export default function MetronomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <SearchBox />
      <section>{children}</section>
    </div>
  )
}
