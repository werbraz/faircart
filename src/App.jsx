import { useState, useMemo } from 'react'
import ReceiptUploader from './components/ReceiptUploader'
import BillItemList from './components/BillItemList'
import SummaryCards from './components/SummaryCards'
import ApiKeyInput from './components/ApiKeyInput'
import { useReceiptScanner } from './hooks/useReceiptScanner'
import SaveShareBar from './components/SaveShareBar'

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('faircart_openrouter_key') || '')
  const [items, setItems] = useState([])
  const [receiptInfo, setReceiptInfo] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [preferFree, setPreferFree] = useState(true)

  const { scanReceipt, status, error, modelUsed, MODELS } = useReceiptScanner()

  const handleImage = async (base64, preview) => {
    if (!apiKey) { alert('กรุณาใส่ OpenRouter API Key ก่อน'); return }
    setPreviewUrl(preview)
    setItems([])
    setReceiptInfo(null)

    const result = await scanReceipt(base64, apiKey, preferFree)
    if (result) {
      setReceiptInfo({ store: result.store, date: result.date, total: result.total })
      setItems(result.items.map(item => ({ ...item, owner: 'split' })))
    }
  }

  const handleOwnerChange = (index, owner) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, owner } : item))
  }

  const totals = useMemo(() => {
    let me = 0, mom = 0
    items.forEach(item => {
      const p = Number(item.price)
      if (item.owner === 'me') me += p
      else if (item.owner === 'mom') mom += p
      else if (item.owner === 'split') { me += p / 2; mom += p / 2 }
    })
    return { me, mom }
  }, [items])

  const totalPrice = useMemo(
    () => items.reduce((s, i) => s + Number(i.price), 0),
    [items]
  )

  const scanning = status === 'scanning'

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-lg mx-auto px-4 py-6 pb-20">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="font-pixel text-yellow-400 text-lg leading-relaxed">🛒 FairCart</h1>
          <p className="text-gray-400 text-sm mt-1">แสกนใบเสร็จ แยกบิลอัตโนมัติ</p>
        </div>

        {/* API Key */}
        {!apiKey && <ApiKeyInput onSave={setApiKey} />}

        {/* Model selector */}
        {apiKey && (
          <div className="flex items-center gap-3 mb-4 bg-gray-800 rounded-xl px-4 py-3">
            <span className="text-gray-400 text-sm shrink-0">โหมด:</span>
            <button
              onClick={() => setPreferFree(true)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-colors ${preferFree ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'}`}
            >
              ฟรี
            </button>
            <button
              onClick={() => setPreferFree(false)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-colors ${!preferFree ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 text-gray-400'}`}
            >
              แม่นยำ
            </button>
          </div>
        )}

        {/* Uploader */}
        <div className="mb-4">
          <ReceiptUploader onImage={handleImage} scanning={scanning} />
        </div>

        {/* Scanning state */}
        {scanning && (
          <div className="text-center py-8">
            <div className="text-4xl animate-bounce mb-3">🤖</div>
            <p className="text-yellow-400 font-bold">กำลังอ่านใบเสร็จ...</p>
            <p className="text-gray-500 text-sm mt-1">AI กำลังวิเคราะห์</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900 border-2 border-red-500 rounded-xl p-4 mb-4">
            <p className="text-red-300 font-bold">❌ เกิดข้อผิดพลาด</p>
            <p className="text-red-400 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Preview + receipt info */}
        {previewUrl && !scanning && (
          <div className="mb-4 flex gap-3 items-start">
            <img src={previewUrl} alt="receipt" className="w-24 h-32 object-cover rounded-xl border-2 border-gray-600 shrink-0" />
            {receiptInfo && (
              <div className="flex-1">
                <p className="text-white font-bold text-lg leading-tight">{receiptInfo.store || 'ไม่ทราบชื่อร้าน'}</p>
                {receiptInfo.date && <p className="text-gray-400 text-sm">{receiptInfo.date}</p>}
                {modelUsed && (
                  <span className="inline-block mt-2 bg-green-900 text-green-300 text-xs px-2 py-1 rounded-lg">
                    🤖 {modelUsed}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        {items.length > 0 && (
          <div className="mb-4">
            <SummaryCards totals={totals} total={totalPrice} />
          </div>
        )}

        {/* Items */}
        <BillItemList items={items} onOwnerChange={handleOwnerChange} />

        {/* Save & Share */}
        <SaveShareBar items={items} receiptInfo={receiptInfo} totals={totals} />

        {/* Reset */}
        {items.length > 0 && (
          <button
            onClick={() => { setItems([]); setPreviewUrl(null); setReceiptInfo(null) }}
            className="w-full mt-6 py-3 bg-gray-800 border-2 border-gray-600 text-gray-400 font-bold rounded-xl hover:border-red-500 hover:text-red-400 transition-colors"
          >
            🔄 สแกนใบเสร็จใหม่
          </button>
        )}

        {apiKey && (
          <p className="text-center text-gray-600 text-xs mt-6">
            API Key บันทึกแล้ว •{' '}
            <button onClick={() => { localStorage.removeItem('faircart_openrouter_key'); setApiKey('') }} className="underline">
              เปลี่ยน
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
