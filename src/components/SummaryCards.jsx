const PEOPLE = [
  { key: 'me', label: 'ฉัน', color: 'bg-blue-500 border-blue-700', text: 'text-white', badge: 'bg-blue-300' },
  { key: 'mom', label: 'แม่', color: 'bg-pink-500 border-pink-700', text: 'text-white', badge: 'bg-pink-300' },
]

export default function SummaryCards({ totals, total }) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      {PEOPLE.map(p => (
        <div
          key={p.key}
          className={`pixel-btn ${p.color} ${p.text} rounded-xl p-4 flex items-center justify-between`}
        >
          <span className="font-bold text-lg">{p.label}</span>
          <span className={`${p.badge} text-gray-800 font-bold px-3 py-1 rounded-lg text-sm`}>
            ฿{(totals[p.key] || 0).toFixed(2)}
          </span>
        </div>
      ))}
      <div className="col-span-2 pixel-btn bg-gray-700 border-gray-900 text-white rounded-xl p-3 flex items-center justify-between">
        <span className="font-bold">ยอดรวมทั้งหมด</span>
        <span className={`font-bold px-3 py-1 rounded-lg text-sm ${
          Math.abs(total - (totals.me + totals.mom)) < 0.01
            ? 'bg-green-400 text-green-900'
            : 'bg-red-400 text-red-900'
        }`}>
          ฿{total.toFixed(2)}
        </span>
      </div>
    </div>
  )
}
