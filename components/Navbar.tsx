export default function RootLayout() {
    let currentNav = 'metronome';

    const activeNav = [
        'font-bold',
    ];
    const inactiveNav = [
        'hover:cursor-pointer',
        'decoration-pink-600',
        'decoration-4',
        'underline-offset-4',
        'hover:underline'
    ]

    return (
        <nav className="py-4 flex justify-between border-b-2 ">
            <div className="flex space-x-4">
                <button className="px-6 py-2 border-2 border-blue-600 text-blue-600 uppercase rounded-full hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out">Add</button>
            </div>
            <div className="flex space-x-16 self-center">
                <a className={`select-none ${currentNav == 'metronome' ? activeNav.join(" ") : inactiveNav.join(" ")}`}>Metronome</a>
                <a className={`select-none ${currentNav == 'list' ? activeNav.join(" ") : inactiveNav.join(" ")}`}>List</a>
                <a className={`select-none ${currentNav == 'about' ? activeNav.join(" ") : inactiveNav.join(" ")}`}>About</a>
            </div>
            <div>
                <button className="px-6 py-2 border-2 border-purple-600 text-purple-600 uppercase rounded-full hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out">Login</button>
            </div>
        </nav>
    )
}