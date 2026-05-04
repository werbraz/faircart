import { useRef, useState, useCallback } from 'react'

export default function ReceiptUploader({ onImage, scanning }) {
  const fileRef = useRef(null)
  const cameraRef = useRef(null)
  const videoRef = useRef(null)
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState(null)

  const toBase64 = file =>
    new Promise(res => {
      const r = new FileReader()
      r.onload = e => res(e.target.result.split(',')[1])
      r.readAsDataURL(file)
    })

  const handleFile = async e => {
    const file = e.target.files[0]
    if (!file) return
    const b64 = await toBase64(file)
    onImage(b64, URL.createObjectURL(file))
  }

  const openCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      setStream(s)
      setShowCamera(true)
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = s }, 100)
    } catch {
      alert('ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการใช้งานกล้อง')
    }
  }

  const closeCamera = () => {
    stream?.getTracks().forEach(t => t.stop())
    setStream(null)
    setShowCamera(false)
  }

  const capture = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    closeCamera()
    onImage(dataUrl.split(',')[1], dataUrl)
  }, [stream])

  return (
    <>
      <div className="flex gap-3">
        <button
          onClick={() => fileRef.current.click()}
          disabled={scanning}
          className="flex-1 pixel-btn bg-yellow-400 border-yellow-600 text-yellow-900 font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-300 active:translate-y-1 transition-transform disabled:opacity-50"
        >
          <span className="text-2xl">📁</span>
          <span>อัพโหลดรูป</span>
        </button>
        <button
          onClick={openCamera}
          disabled={scanning}
          className="flex-1 pixel-btn bg-green-400 border-green-600 text-green-900 font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-green-300 active:translate-y-1 transition-transform disabled:opacity-50"
        >
          <span className="text-2xl">📷</span>
          <span>ถ่ายรูป</span>
        </button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {showCamera && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover w-full" />
          <div className="flex gap-4 p-6 bg-black">
            <button onClick={closeCamera} className="flex-1 py-4 bg-red-600 text-white font-bold rounded-xl text-lg">
              ✕ ยกเลิก
            </button>
            <button onClick={capture} className="flex-1 py-4 bg-white text-black font-bold rounded-xl text-lg">
              📸 ถ่าย
            </button>
          </div>
        </div>
      )}
    </>
  )
}
