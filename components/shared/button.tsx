export default function MainButton({ children, color }) {
  const style = {
    mobile: ['px-4', 'text-blue-400', 'py-2'],
    sm: ['sm:px-6', 'text-blue-600'],
    general: ['uppercase', 'border-2'],
    hover: [
      'hover:bg-black',
      'hover:bg-opacity-5',
      'focus:outline-none',
      'focus:ring-0',
      'transition',
      'duration-150',
      'ease-in-out',
    ],
    shape: ['rounded-full'],
    color: color ? [`border-${color}-600`] : [],
  }

  const classes = Object.values(style).flat().join(' ')

  return <button className={classes}>{children}</button>
}
