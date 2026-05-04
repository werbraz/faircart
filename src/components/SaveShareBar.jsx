import { useState } from 'react'

const FINANCE_APP_URL = 'https://finance-app-werbrazs-projects.vercel.app'
const HISTORY_KEY = 'faircart_history'

function buildMyTransactions(items, receiptInfo) {
  const date = new Date().toISOString().slice(0, 10)
  const store = receiptInfo?.store || 'ใบเสร็จ FairCart'
  return items
    .filter(item => item.owner === 'me' || item.owner === 'split')
    .map(item => ({
      type: 'expense',
      amount: item.owner === 'split' ? Number(item.price) / 2 : Number(item.price),
      category: 'อาหาร/ของใช้',
      note: `${item.name} (จาก ${store})`,
      date,
      source: 'FairCart',
    }))
}

export default function SaveShareBar({ items, receiptInfo, totals }) {
  const [saved, setSaved] = useState(false)
  const [shared, setShared] = useState(false)

  const handleSave = () => {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    const entry = {
      id: Date.now(),
      savedAt: new Date().toLocaleString('th-TH'),
      store: receiptInfo?.store || 'ไม่ทราบร้าน',
      date: receiptInfo?.date || '',
      items,
      totals,
    }
    history.unshift(entry)
    if (history.length > 50) history.pop()
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleShare = () => {
    const txs = buildMyTransactions(items, receiptInfo)
    if (!txs.length) {
      alert('ไม่มีรายการที่เป็นของ "ฉัน" ในบิลนี้')
      return
    }
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(txs))))
    const url = `${FINANCE_APP_URL}?import=${encoded}`
    window.open(url, '_blank')
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  if (!items.length) return null

  return (
    <div className="flex gap-3 mt-4">
      <button
        onClick={handleSave}
        className={`flex-1 pixel-btn py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:translate-y-0.5 border-2 ${
          saved
            ? 'bg-green-500 border-green-700 text-white'
            : 'bg-blue-500 border-blue-700 text-white hover:bg-blue-400'
        }`}
      >
        <span>{saved ? '✅' : '💾'}</span>
        <span>{saved ? 'บันทึกแล้ว!' : 'บันทึก'}</span>
      </button>

      <button
        onClick={handleShare}
        className={`flex-1 pixel-btn py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:translate-y-0.5 border-2 ${
          shared
            ? 'bg-green-500 border-green-700 text-white'
            : 'bg-orange-500 border-orange-700 text-white hover:bg-orange-400'
        }`}
      >
        <span>{shared ? '✅' : '📤'}</span>
        <span>{shared ? 'แชร์แล้ว!' : 'แชร์ไป FinFlow'}</span>
      </button>
    </div>
  )
}
