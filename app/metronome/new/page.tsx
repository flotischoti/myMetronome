import Metronome, {
  StoredMetronome,
} from '../../../components/metronome/Metronome'

export default async function Page({ params }: { params: { id: string } }) {
  return (
    <div>
      <Metronome dbMetronome={null} />
    </div>
  )
}
