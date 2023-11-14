export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="flex flex-col gap-3 max-w-sm mt-2 p-3 mx-auto shadow">
      <div className="skeleton h-4 w-6/12"></div>
      <div className="flex justify-center items-end">
        <div className="skeleton h-20 w-28"></div>
        <div className="skeleton h-4 w-12"></div>
      </div>
      <div className="skeleton h-12 w-full rounded-l-full rounded-r-full"></div>
      <div className="flex gap-4">
        <div className="skeleton h-24 w-6/12 rounded-full"></div>
        <div className="skeleton h-24 w-6/12 rounded-full"></div>
      </div>
      <div className="skeleton h-4 w-6/12"></div>
      <div className="skeleton h-4 w-4/12"></div>
      <div className="skeleton h-4 w-5/12"></div>
      <div className="flex justify-between">
        <div className="skeleton h-8 w-1/12"></div>
        <div className="skeleton h-8 w-1/12"></div>
      </div>
    </div>
  )
}
