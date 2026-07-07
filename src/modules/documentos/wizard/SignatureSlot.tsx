import { useRef, type PointerEvent } from 'react'
import type { Signer } from '@/types'

interface DragState {
  startX: number
  startY: number
  originX: number
  originY: number
  dragging: boolean
}

interface Props {
  signer: Signer
  index: number
  bounds: { width: number; height: number }
  removable: boolean
  onMove: (id: number, x: number, y: number) => void
  onRemove: (id: number) => void
}

export default function SignatureSlot({ signer, index, bounds, removable, onMove, onRemove }: Props) {
  const elRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest('.rm')) return
    elRef.current?.setPointerCapture(e.pointerId)
    dragRef.current = { startX: e.clientX, startY: e.clientY, originX: signer.x, originY: signer.y, dragging: true }
  }
  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag?.dragging) return
    const width = elRef.current?.offsetWidth ?? 118
    const height = elRef.current?.offsetHeight ?? 30
    const nx = Math.max(4, Math.min(bounds.width - width - 4, drag.originX + (e.clientX - drag.startX)))
    const ny = Math.max(38, Math.min(bounds.height - height - 4, drag.originY + (e.clientY - drag.startY)))
    onMove(signer.id, nx, ny)
  }
  function handlePointerUp() {
    if (dragRef.current) dragRef.current.dragging = false
  }
  function handleRemoveClick(e: PointerEvent<HTMLSpanElement>) {
    e.stopPropagation()
    onRemove(signer.id)
  }

  const label = signer.nome ? signer.nome.split(' ')[0] : signer.cargo || `Signatário ${index + 1}`

  return (
    <div
      ref={elRef}
      className={`sig-slot${signer.signed ? ' signed' : ''}`}
      style={{ left: signer.x, top: signer.y }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      ✍ <span>{label}</span>
      {signer.signed ? ' ✓' : removable && (
        <span className="rm" onPointerDown={handleRemoveClick}>
          ✕
        </span>
      )}
    </div>
  )
}
