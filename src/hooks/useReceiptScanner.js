import { useState } from 'react'
import { getFewShotExamples, savePattern } from '../lib/receiptCache'

const MODELS = [
  { id: 'qwen/qwen-2.5-vl-7b-instruct:free', label: 'Qwen 2.5 VL (ฟรี)', free: true },
  { id: 'meta-llama/llama-4-scout:free', label: 'Llama 4 Scout (ฟรี)', free: true },
  { id: 'google/gemini-2.0-flash', label: 'Gemini 2.0 Flash (ถูก)', free: false },
  { id: 'qwen/qwen-2.5-vl-72b-instruct', label: 'Qwen 2.5 VL 72B (แม่นยำ)', free: false },
]

function buildPrompt() {
  const examples = getFewShotExamples(2)
  const exampleSection = examples
    ? `\nตัวอย่างใบเสร็จที่ผ่านมา:\n${examples}\n`
    : ''
  return `คุณเป็นผู้ช่วยอ่านใบเสร็จ ดึงรายการสินค้าและราคาออกมา${exampleSection}
ตอบเป็น JSON เท่านั้น รูปแบบ:
{
  "store": "ชื่อร้าน",
  "date": "วันที่ (ถ้ามี)",
  "total": 0.00,
  "items": [
    { "name": "ชื่อสินค้า", "price": 0.00 }
  ]
}
ถ้าอ่านราคาไม่ชัดให้ใส่ 0 ห้ามเพิ่มข้อความอื่นนอกจาก JSON`
}

export function useReceiptScanner() {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [modelUsed, setModelUsed] = useState(null)

  async function scanReceipt(imageBase64, apiKey, preferFree = true) {
    setStatus('scanning')
    setError(null)

    const models = preferFree
      ? MODELS
      : MODELS.filter(m => !m.free).concat(MODELS.filter(m => m.free))

    for (const model of models) {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'FairCart',
          },
          body: JSON.stringify({
            model: model.id,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: buildPrompt() },
                  {
                    type: 'image_url',
                    image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
                  },
                ],
              },
            ],
            max_tokens: 1024,
          }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          if (res.status === 429 || res.status === 503) continue
          throw new Error(err?.error?.message || `HTTP ${res.status}`)
        }

        const data = await res.json()
        const raw = data.choices?.[0]?.message?.content || ''
        const jsonMatch = raw.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('ไม่พบ JSON ในคำตอบ')

        const parsed = JSON.parse(jsonMatch[0])
        if (!parsed.items?.length) throw new Error('ไม่พบรายการสินค้า')

        if (parsed.store) savePattern(parsed.store, parsed.items)
        setModelUsed(model.label)
        setStatus('done')
        return parsed
      } catch (err) {
        if (models.indexOf(model) === models.length - 1) {
          setError(err.message)
          setStatus('error')
          return null
        }
      }
    }
  }

  return { scanReceipt, status, error, modelUsed, MODELS }
}
