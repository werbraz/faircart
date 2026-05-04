import { useState } from 'react'

export default function ApiKeyInput({ onSave }) {
  const [key, setKey] = useState(localStorage.getItem('faircart_openrouter_key') || '')
  const [show, setShow] = useState(false)

  const save = () => {
    if (!key.trim()) return
    localStorage.setItem('faircart_openrouter_key', key.trim())
    onSave(key.trim())
  }

  return (
    <div className="bg-gray-800 border-2 border-yellow-500 rounded-xl p-4 mb-4">
      <p className="text-yellow-400 font-bold mb-1 flex items-center gap-2">
        <span>🔑</span> OpenRouter API Key
      </p>
      <p className="text-gray-400 text-sm mb-3">
        ขอฟรีได้ที่ openrouter.ai — ใช้ model ฟรีไม่เสียเงิน
      </p>
      <div className="flex gap-2">
        <input
          type={show ? 'text' : 'password'}
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder="sk-or-..."
          className="flex-1 bg-gray-900 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
          onKeyDown={e => e.key === 'Enter' && save()}
        />
        <button onClick={() => setShow(s => !s)} className="text-gray-400 px-2">
          {show ? '🙈' : '👁️'}
        </button>
        <button
          onClick={save}
          className="pixel-btn bg-yellow-400 border-yellow-600 text-yellow-900 font-bold px-4 py-2 rounded-lg"
        >
          บันทึก
        </button>
      </div>
    </div>
  )
}
