import Navigation from './Navigation'
import MainButton from '../shared/Button'

export default function Navbar() {
  return (
    <nav className="px-4 py-4 border-b-2">
      <div id="navWrapper" className="container mx-auto flex justify-between">
        <div id="controlArea" className="flex space-x-4">
          <MainButton color="orange">Add</MainButton>
        </div>
        <Navigation />
        <div id="accountArea">
          <MainButton color="purple">Login</MainButton>
        </div>
      </div>
    </nav>
  )
}
