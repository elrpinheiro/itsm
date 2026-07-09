import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type PointerEvent } from 'react'

export interface SignaturePadHandle {
  clear: () => void
  getDataURL: () => string | null
}

const SignaturePad = forwardRef<SignaturePadHandle>(function SignaturePad(_props, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const drawingRef = useRef(false)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.strokeStyle = '#185FA5'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  useImperativeHandle(ref, () => ({
    clear() {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
      setHasSignature(false)
    },
    getDataURL() {
      if (!hasSignature || !canvasRef.current) return null
      return canvasRef.current.toDataURL('image/png')
    },
  }))

  function getPos(e: PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }
  function start(e: PointerEvent<HTMLCanvasElement>) {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    canvasRef.current?.setPointerCapture(e.pointerId)
    drawingRef.current = true
    const p = getPos(e)
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    setHasSignature(true)
  }
  function move(e: PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const p = getPos(e)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
  }
  function end() {
    drawingRef.current = false
  }

  return (
    <div className="sig-pad" ref={containerRef}>
      {!hasSignature && <span className="sig-hint">Assine aqui</span>}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        onPointerLeave={end}
      />
    </div>
  )
})

export default SignaturePad
