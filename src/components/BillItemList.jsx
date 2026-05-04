const OWNER_OPTS = [
  { key: 'me', label: 'ฉัน', active: 'bg-blue-500 border-blue-700 text-white', inactive: 'bg-gray-700 border-gray-600 text-gray-400' },
  { key: 'split', label: 'หาร 2', active: 'bg-purple-500 border-purple-700 text-white', inactive: 'bg-gray-700 border-gray-600 text-gray-400' },
  { key: 'mom', label: 'แม่', active: 'bg-pink-500 border-pink-700 text-white', inactive: 'bg-gray-700 border-gray-600 text-gray-400' },
]

export default function BillItemList({ items, onOwnerChange }) {
  if (!items.length) return null

  return (
    <div className="space-y-3">
      <h2 className="text-white font-bold text-lg flex items-center gap-2">
        <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-lg">{items.length}</span>
        รายการสินค้า
      </h2>
      {items.map((item, i) => (
        <div key={i} className="bg-gray-800 border-2 border-gray-600 rounded-xl p-4">
          <div className="flex justify-between items-start mb-3">
            <p className="text-white font-semibold flex-1 pr-2 leading-snug">{item.name}</p>
            <span className="text-yellow-400 font-bold shrink-0">฿{Number(item.price).toFixed(2)}</span>
          </div>
          <div className="flex gap-2">
            {OWNER_OPTS.map(opt => (
              <button
                key={opt.key}
                onClick={() => onOwnerChange(i, opt.key)}
                className={`flex-1 pixel-btn py-2 px-1 text-sm font-bold rounded-lg transition-all active:translate-y-0.5 border-2 ${
                  item.owner === opt.key ? opt.active : opt.inactive
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
