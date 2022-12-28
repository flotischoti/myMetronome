import Navigation from './Navigation'

export default function Navbar() {
  return (
    <nav className="px-4 py-4 border-b-2">
      <div id="navWrapper" className="container mx-auto flex justify-between">
        <div id="controlArea" className="flex space-x-4">
          <button className="px-6 py-2 border-2 border-blue-600 text-blue-600 uppercase rounded-full hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out">
            Add
          </button>
        </div>
        <Navigation />
        <div id="accountArea">
          <button className="px-6 py-2 border-2 border-purple-600 text-purple-600 uppercase rounded-full hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out">
            Login
          </button>
        </div>
      </div>
    </nav>
  )
}
