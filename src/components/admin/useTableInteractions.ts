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

type ColResizeState =
  | null
  | {
      pointerId: number
      startClientX: number
      table: HTMLTableElement
      colIndex: number
      col: HTMLElement
      adjCol: HTMLElement
      startColPct: number
      startAdjPct: number
      tableWidthPx: number
      rafId: number | null
    }

function getCellFromTarget(target: EventTarget | null): HTMLTableCellElement | null {
  if (!target) return null
  const el =
    target instanceof Element
      ? target
      : (target as any)?.parentElement instanceof Element
        ? (target as any).parentElement
        : null
  if (!el) return null
  const cell = el.closest('td,th') as HTMLTableCellElement | null
  return cell
}

function getCellFromEvent(doc: Document, ev: any): HTMLTableCellElement | null {
  const direct = getCellFromTarget(ev?.target ?? null)
  if (direct) return direct
  if (typeof ev?.clientX !== 'number' || typeof ev?.clientY !== 'number') return null
  const elAt = doc.elementFromPoint(ev.clientX, ev.clientY) as HTMLElement | null
  return (elAt?.closest?.('td,th') as HTMLTableCellElement | null) ?? null
}

function isNearBottomBorder(cell: HTMLTableCellElement, clientX: number, clientY: number) {
  const rect = cell.getBoundingClientRect()
  const threshold = 8
  const insideX = clientX >= rect.left && clientX <= rect.right
  const nearBottom = Math.abs(clientY - rect.bottom) <= threshold
  return insideX && nearBottom
}

function isNearTopBorder(cell: HTMLTableCellElement, clientX: number, clientY: number) {
  const rect = cell.getBoundingClientRect()
  const threshold = 8
  const insideX = clientX >= rect.left && clientX <= rect.right
  const nearTop = Math.abs(clientY - rect.top) <= threshold
  return insideX && nearTop
}

function isNearRightBorder(cell: HTMLTableCellElement, clientX: number, clientY: number) {
  const rect = cell.getBoundingClientRect()
  const threshold = 8
  const insideY = clientY >= rect.top && clientY <= rect.bottom
  const nearRight = Math.abs(clientX - rect.right) <= threshold
  return insideY && nearRight
}

function isNearLeftBorder(cell: HTMLTableCellElement, clientX: number, clientY: number) {
  const rect = cell.getBoundingClientRect()
  const threshold = 8
  const insideY = clientY >= rect.top && clientY <= rect.bottom
  const nearLeft = Math.abs(clientX - rect.left) <= threshold
  return insideY && nearLeft
}

function getPointerId(ev: any): number {
  return typeof ev?.pointerId === 'number' ? ev.pointerId : 0
}

function getPrevRow(row: HTMLTableRowElement): HTMLTableRowElement | null {
  const prev = row.previousElementSibling as HTMLElement | null
  if (prev && prev.tagName.toUpperCase() === 'TR') return prev as HTMLTableRowElement

  const section = row.parentElement as HTMLElement | null
  const prevSection = section?.previousElementSibling as HTMLElement | null
  const last = prevSection?.lastElementChild as HTMLElement | null
  if (last && last.tagName.toUpperCase() === 'TR') return last as HTMLTableRowElement
  return null
}

function getColumnCountFromTable(table: HTMLTableElement): number {
  const firstRow = table.rows?.[0]
  if (!firstRow) return 0
  let count = 0
  for (const cell of Array.from(firstRow.cells)) count += Math.max(1, (cell as HTMLTableCellElement).colSpan || 1)
  return count
}

function ensureColgroup(table: HTMLTableElement, colCount: number): HTMLTableColElement[] {
  const existing = table.querySelector('colgroup')
  if (existing) return Array.from(existing.querySelectorAll('col')) as HTMLTableColElement[]

  const colgroup = table.ownerDocument.createElement('colgroup')
  const pct = colCount > 0 ? 100 / colCount : 100
  for (let i = 0; i < colCount; i++) {
    const col = table.ownerDocument.createElement('col')
    col.style.width = `${pct}%`
    colgroup.appendChild(col)
  }
  table.insertBefore(colgroup, table.firstChild)
  return Array.from(colgroup.querySelectorAll('col')) as HTMLTableColElement[]
}

function parsePercent(value: string | null | undefined): number | null {
  if (!value) return null
  const m = value.trim().match(/^([0-9.]+)\s*%$/)
  if (!m) return null
  const n = Number(m[1])
  return Number.isFinite(n) ? n : null
}

export function useTableInteractions(args: {
  wrapperRef: React.RefObject<HTMLDivElement>
}) {
  const editorRef = useRef<any>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const attachRafRef = useRef<number | null>(null)
  const rowResizeRef = useRef<RowResizeState>(null)
  const colResizeRef = useRef<ColResizeState>(null)
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
      const doc = editor.getDoc?.() as Document | null
      doc?.documentElement?.style.removeProperty('cursor')
      editor.undoManager.add()
      editor.fire('Change')
    }
  }, [])

  const stopColResize = useCallback(() => {
    const st = colResizeRef.current
    colResizeRef.current = null
    if (st?.rafId != null) window.cancelAnimationFrame(st.rafId)
    st && (st.rafId = null)
    resizeCleanupRef.current?.()
    resizeCleanupRef.current = null
    const editor = editorRef.current
    if (editor) {
      editor.getBody()?.style.removeProperty('cursor')
      const doc = editor.getDoc?.() as Document | null
      doc?.documentElement?.style.removeProperty('cursor')
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

  const applyColWidths = useCallback((col: HTMLElement, colPct: number, adjCol: HTMLElement, adjPct: number) => {
    const editor = editorRef.current
    if (!editor) return
    editor.dom.setStyle(col, 'width', `${colPct.toFixed(3)}%`)
    editor.dom.setStyle(adjCol, 'width', `${adjPct.toFixed(3)}%`)
    editor.nodeChanged()
  }, [])

  const onWindowPointerMove = useCallback((ev: PointerEvent) => {
    const st = rowResizeRef.current
    if (!st) return
    if (getPointerId(ev) !== st.pointerId) return
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

  const onWindowPointerMoveCol = useCallback((ev: PointerEvent) => {
    const st = colResizeRef.current
    if (!st) return
    if (getPointerId(ev) !== st.pointerId) return
    if (st.rafId != null) return

    st.rafId = window.requestAnimationFrame(() => {
      const cur = colResizeRef.current
      if (!cur) return
      cur.rafId = null

      const dx = ev.clientX - cur.startClientX
      const deltaPct = cur.tableWidthPx > 0 ? (dx / cur.tableWidthPx) * 100 : 0
      const minPx = 34
      const minPct = cur.tableWidthPx > 0 ? (minPx / cur.tableWidthPx) * 100 : 2

      let nextCol = cur.startColPct + deltaPct
      let nextAdj = cur.startAdjPct - deltaPct

      if (nextCol < minPct) {
        const diff = minPct - nextCol
        nextCol = minPct
        nextAdj -= diff
      }
      if (nextAdj < minPct) {
        const diff = minPct - nextAdj
        nextAdj = minPct
        nextCol -= diff
      }

      nextCol = Math.max(minPct, nextCol)
      nextAdj = Math.max(minPct, nextAdj)

      applyColWidths(cur.col, nextCol, cur.adjCol, nextAdj)
    })
  }, [applyColWidths])

  const onWindowPointerUp = useCallback((ev: PointerEvent) => {
    const st = rowResizeRef.current
    if (!st) return
    if (getPointerId(ev) !== st.pointerId) return
    stopRowResize()
  }, [stopRowResize])

  const onWindowPointerUpCol = useCallback((ev: PointerEvent) => {
    const st = colResizeRef.current
    if (!st) return
    if (getPointerId(ev) !== st.pointerId) return
    stopColResize()
  }, [stopColResize])

  const attach = useCallback((editor: any) => {
    cleanupRef.current?.()
    cleanupRef.current = null
    if (attachRafRef.current != null) {
      window.cancelAnimationFrame(attachRafRef.current)
      attachRafRef.current = null
    }
    editorRef.current = editor

    const tryAttach = (attempt: number) => {
      const doc = editor?.getDoc?.() as Document | null
      const body = editor?.getBody?.() as HTMLElement | null
      if (!doc || !body) {
        if (attempt >= 20) return
        attachRafRef.current = window.requestAnimationFrame(() => tryAttach(attempt + 1))
        return
      }

      attachRafRef.current = null

      const onPointerMove = (ev: any) => {
        if (rowResizeRef.current || colResizeRef.current) return
        const cell = getCellFromEvent(doc, ev)
        if (!cell) {
          body.style.removeProperty('cursor')
          doc.documentElement.style.removeProperty('cursor')
          return
        }
        const nearTop = isNearTopBorder(cell, ev.clientX, ev.clientY)
        const nearBottom = isNearBottomBorder(cell, ev.clientX, ev.clientY)
        const nearLeft = isNearLeftBorder(cell, ev.clientX, ev.clientY)
        const nearRight = isNearRightBorder(cell, ev.clientX, ev.clientY)

        const rect = cell.getBoundingClientRect()
        const dTop = Math.abs(ev.clientY - rect.top)
        const dBottom = Math.abs(ev.clientY - rect.bottom)
        const dLeft = Math.abs(ev.clientX - rect.left)
        const dRight = Math.abs(ev.clientX - rect.right)

        const hasRow = nearTop || nearBottom
        const hasCol = nearLeft || nearRight

        if (!hasRow && !hasCol) {
          body.style.removeProperty('cursor')
          doc.documentElement.style.removeProperty('cursor')
          return
        }

        if (hasCol && (!hasRow || Math.min(dLeft, dRight) <= Math.min(dTop, dBottom))) {
          body.style.cursor = 'col-resize'
          doc.documentElement.style.cursor = 'col-resize'
          return
        }

        body.style.cursor = 'row-resize'
        doc.documentElement.style.cursor = 'row-resize'
      }

      const onPointerDown = (ev: any) => {
        if (rowResizeRef.current || colResizeRef.current) return
        const cell = getCellFromEvent(doc, ev)
        if (!cell) return

        const rect = cell.getBoundingClientRect()
        const nearTop = isNearTopBorder(cell, ev.clientX, ev.clientY)
        const nearBottom = isNearBottomBorder(cell, ev.clientX, ev.clientY)
        const nearLeft = isNearLeftBorder(cell, ev.clientX, ev.clientY)
        const nearRight = isNearRightBorder(cell, ev.clientX, ev.clientY)
        const dTop = Math.abs(ev.clientY - rect.top)
        const dBottom = Math.abs(ev.clientY - rect.bottom)
        const dLeft = Math.abs(ev.clientX - rect.left)
        const dRight = Math.abs(ev.clientX - rect.right)

        const wantCol = (nearLeft || nearRight) && (!nearTop && !nearBottom || Math.min(dLeft, dRight) <= Math.min(dTop, dBottom))
        const wantRow = !wantCol && (nearTop || nearBottom)

        if (wantRow) {
          const baseRow = cell.parentElement as HTMLTableRowElement | null
          if (!baseRow || baseRow.tagName.toUpperCase() !== 'TR') return
          const row = nearTop ? getPrevRow(baseRow) : baseRow
          if (!row) return

          ev.preventDefault()
          ev.stopPropagation()

          editor.undoManager.add()
          rowResizeRef.current = {
            pointerId: getPointerId(ev),
            startScreenY: ev.screenY,
            startHeight: row.getBoundingClientRect().height || row.offsetHeight || 24,
            row,
            rafId: null,
          }

        if (typeof (cell as any).setPointerCapture === 'function' && typeof ev?.pointerId === 'number') {
          try {
            (cell as any).setPointerCapture(ev.pointerId)
          } catch {}
        }

        const onMove = (moveEv: any) => onWindowPointerMove(moveEv as any)
        const onUp = (upEv: any) => onWindowPointerUp(upEv as any)

        if (typeof doc.defaultView?.PointerEvent === 'function') {
          doc.addEventListener('pointermove', onMove as any, true)
          doc.addEventListener('pointerup', onUp as any, true)
          doc.addEventListener('pointercancel', onUp as any, true)
        } else {
          doc.addEventListener('mousemove', onMove as any, true)
          doc.addEventListener('mouseup', onUp as any, true)
        }
        resizeCleanupRef.current = () => {
          doc.removeEventListener('pointermove', onMove as any, true as any)
          doc.removeEventListener('pointerup', onUp as any, true as any)
          doc.removeEventListener('pointercancel', onUp as any, true as any)
          doc.removeEventListener('mousemove', onMove as any, true as any)
          doc.removeEventListener('mouseup', onUp as any, true as any)
        }
          return
        }

        if (wantCol) {
          if ((cell as HTMLTableCellElement).colSpan && (cell as HTMLTableCellElement).colSpan > 1) return
          const table = cell.closest('table') as HTMLTableElement | null
          if (!table) return

        const colCount = getColumnCountFromTable(table)
        if (!colCount) return

        const colIndex = cell.cellIndex
        if (colIndex < 0) return

        const cols = ensureColgroup(table, colCount)
        const safeCols = cols.length >= colCount ? cols : cols.concat(Array.from({ length: colCount - cols.length }, () => table.ownerDocument.createElement('col')))
        const idx = Math.min(colIndex, safeCols.length - 1)

        const isEdgeLeft = nearLeft && (!nearRight || dLeft <= dRight)
        const isEdgeRight = nearRight && !isEdgeLeft

        const targetIdx = isEdgeLeft ? idx - 1 : (idx === safeCols.length - 1 ? idx - 1 : idx)
        const adjIdx = isEdgeLeft ? idx : targetIdx + 1
        if (targetIdx < 0 || adjIdx < 0 || adjIdx >= safeCols.length) return

        const col = safeCols[targetIdx]
        const adjCol = safeCols[adjIdx]

        const tableRect = table.getBoundingClientRect()
        const tableWidthPx = tableRect.width || table.offsetWidth || 1
        const colPct = parsePercent(col.style.width) ?? ((tableWidthPx > 0 ? (col.getBoundingClientRect().width / tableWidthPx) * 100 : 0) || (100 / colCount))
        const adjPct = parsePercent(adjCol.style.width) ?? ((tableWidthPx > 0 ? (adjCol.getBoundingClientRect().width / tableWidthPx) * 100 : 0) || (100 / colCount))

        ev.preventDefault()
        ev.stopPropagation()

        editor.undoManager.add()
        colResizeRef.current = {
          pointerId: getPointerId(ev),
          startClientX: ev.clientX,
          table,
          colIndex: targetIdx,
          col,
          adjCol,
          startColPct: colPct,
          startAdjPct: adjPct,
          tableWidthPx,
          rafId: null,
        }

        if (typeof (cell as any).setPointerCapture === 'function' && typeof ev?.pointerId === 'number') {
          try {
            (cell as any).setPointerCapture(ev.pointerId)
          } catch {}
        }

        const onMove = (moveEv: any) => onWindowPointerMoveCol(moveEv as any)
        const onUp = (upEv: any) => onWindowPointerUpCol(upEv as any)

        if (typeof doc.defaultView?.PointerEvent === 'function') {
          doc.addEventListener('pointermove', onMove as any, true)
          doc.addEventListener('pointerup', onUp as any, true)
          doc.addEventListener('pointercancel', onUp as any, true)
        } else {
          doc.addEventListener('mousemove', onMove as any, true)
          doc.addEventListener('mouseup', onUp as any, true)
        }
        resizeCleanupRef.current = () => {
          doc.removeEventListener('pointermove', onMove as any, true as any)
          doc.removeEventListener('pointerup', onUp as any, true as any)
          doc.removeEventListener('pointercancel', onUp as any, true as any)
          doc.removeEventListener('mousemove', onMove as any, true as any)
          doc.removeEventListener('mouseup', onUp as any, true as any)
        }
        }
      }

      if (typeof doc.defaultView?.PointerEvent === 'function') {
        doc.addEventListener('pointermove', onPointerMove as any, { passive: true, capture: true } as any)
        doc.addEventListener('pointerdown', onPointerDown as any, true)
      } else {
        doc.addEventListener('mousemove', onPointerMove as any, { passive: true, capture: true } as any)
        doc.addEventListener('mousedown', onPointerDown as any, true)
      }

      cleanupRef.current = () => {
        doc.removeEventListener('pointermove', onPointerMove as any, true as any)
        doc.removeEventListener('pointerdown', onPointerDown as any, true as any)
        doc.removeEventListener('mousemove', onPointerMove as any, true as any)
        doc.removeEventListener('mousedown', onPointerDown as any, true as any)
      }
    }

    tryAttach(0)
  }, [onWindowPointerMove, onWindowPointerMoveCol, onWindowPointerUp, onWindowPointerUpCol])

  useEffect(() => {
    return () => {
      cleanupRef.current?.()
      cleanupRef.current = null
      resizeCleanupRef.current?.()
      resizeCleanupRef.current = null
      if (attachRafRef.current != null) {
        window.cancelAnimationFrame(attachRafRef.current)
        attachRafRef.current = null
      }
      editorRef.current = null
      rowResizeRef.current = null
      colResizeRef.current = null
    }
  }, [])

  return useMemo(() => ({ attach }), [attach])
}
