import { useCallback, useEffect, useMemo, useRef } from 'react'

type RowResizeState =
  | null
  | {
      pointerId: number
      startScreenY: number
      startHeight: number
      row: HTMLTableRowElement
      rafId: number | null
    }

function getCellFromTarget(target: EventTarget | null): HTMLTableCellElement | null {
  if (!(target instanceof Element)) return null
  const cell = target.closest('td,th') as HTMLTableCellElement | null
  return cell
}

function isNearBottomBorder(cell: HTMLTableCellElement, clientX: number, clientY: number) {
  const rect = cell.getBoundingClientRect()
  const threshold = 4
  const insideX = clientX >= rect.left + threshold && clientX <= rect.right - threshold
  const nearBottom = Math.abs(clientY - rect.bottom) <= threshold
  return insideX && nearBottom
}

export function useTableInteractions(args: {
  wrapperRef: React.RefObject<HTMLDivElement>
}) {
  const editorRef = useRef<any>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const rowResizeRef = useRef<RowResizeState>(null)
  const resizeCleanupRef = useRef<(() => void) | null>(null)

  const stopRowResize = useCallback(() => {
    const st = rowResizeRef.current
    rowResizeRef.current = null
    if (st?.rafId != null) window.cancelAnimationFrame(st.rafId)
    st && (st.rafId = null)
    resizeCleanupRef.current?.()
    resizeCleanupRef.current = null
    const editor = editorRef.current
    if (editor) {
      editor.getBody()?.style.removeProperty('cursor')
      editor.undoManager.add()
      editor.fire('Change')
    }
  }, [])

  const applyRowHeight = useCallback((row: HTMLTableRowElement, heightPx: number) => {
    const editor = editorRef.current
    if (!editor) return
    const px = Math.max(14, Math.round(heightPx))
    editor.dom.setAttrib(row, 'height', String(px))
    const cells = Array.from(row.cells) as HTMLTableCellElement[]
    for (const cell of cells) {
      editor.dom.setAttrib(cell, 'height', String(px))
    }
    editor.nodeChanged()
  }, [])

  const onWindowPointerMove = useCallback((ev: PointerEvent) => {
    const st = rowResizeRef.current
    if (!st) return
    if (ev.pointerId !== st.pointerId) return
    if (st.rafId != null) return

    st.rafId = window.requestAnimationFrame(() => {
      const cur = rowResizeRef.current
      if (!cur) return
      cur.rafId = null
      const dy = ev.screenY - cur.startScreenY
      const nextH = Math.max(14, cur.startHeight + dy)
      applyRowHeight(cur.row, nextH)
    })
  }, [applyRowHeight])

  const onWindowPointerUp = useCallback((ev: PointerEvent) => {
    const st = rowResizeRef.current
    if (!st) return
    if (ev.pointerId !== st.pointerId) return
    stopRowResize()
  }, [stopRowResize])

  const attach = useCallback((editor: any) => {
    cleanupRef.current?.()
    cleanupRef.current = null
    editorRef.current = editor

    const doc = editor?.getDoc?.() as Document | null
    const body = editor?.getBody?.() as HTMLElement | null
    if (!doc || !body) return

    const onPointerMove = (ev: PointerEvent) => {
      if (rowResizeRef.current) return
      const cell = getCellFromTarget(ev.target)
      if (!cell) {
        body.style.removeProperty('cursor')
        return
      }
      if (isNearBottomBorder(cell, ev.clientX, ev.clientY)) {
        body.style.cursor = 'row-resize'
      } else if (body.style.cursor === 'row-resize') {
        body.style.removeProperty('cursor')
      }
    }

    const onPointerDown = (ev: PointerEvent) => {
      if (rowResizeRef.current) return
      const cell = getCellFromTarget(ev.target)
      if (!cell) return
      if (!isNearBottomBorder(cell, ev.clientX, ev.clientY)) return

      const row = cell.parentElement as HTMLTableRowElement | null
      if (!row || row.tagName.toUpperCase() !== 'TR') return

      ev.preventDefault()
      ev.stopPropagation()

      editor.undoManager.add()
      rowResizeRef.current = {
        pointerId: ev.pointerId,
        startScreenY: ev.screenY,
        startHeight: row.getBoundingClientRect().height || row.offsetHeight || 24,
        row,
        rafId: null,
      }

      if (typeof (cell as any).setPointerCapture === 'function') {
        try {
          (cell as any).setPointerCapture(ev.pointerId)
        } catch {}
      }

      const onMove = (moveEv: PointerEvent) => onWindowPointerMove(moveEv)
      const onUp = (upEv: PointerEvent) => onWindowPointerUp(upEv)

      doc.addEventListener('pointermove', onMove)
      doc.addEventListener('pointerup', onUp)
      doc.addEventListener('pointercancel', onUp)
      resizeCleanupRef.current = () => {
        doc.removeEventListener('pointermove', onMove as any)
        doc.removeEventListener('pointerup', onUp as any)
        doc.removeEventListener('pointercancel', onUp as any)
      }
    }

    doc.addEventListener('pointermove', onPointerMove, { passive: true })
    doc.addEventListener('pointerdown', onPointerDown)

    cleanupRef.current = () => {
      doc.removeEventListener('pointermove', onPointerMove as any)
      doc.removeEventListener('pointerdown', onPointerDown as any)
    }
  }, [onWindowPointerMove, onWindowPointerUp])

  useEffect(() => {
    return () => {
      cleanupRef.current?.()
      cleanupRef.current = null
      resizeCleanupRef.current?.()
      resizeCleanupRef.current = null
      editorRef.current = null
      rowResizeRef.current = null
    }
  }, [])

  return useMemo(() => ({ attach }), [attach])
}
