import { useCallback, useEffect, useRef } from 'react'

type DragState =
  | null
  | {
      pointerId: number
      active: boolean
      hasExceededThreshold: boolean
      startClientX: number
      startClientY: number
      range: Range | null
      lastClientX: number
      lastClientY: number
      rafId: number | null
      removeScrollListener: (() => void) | null
      originParent: Node | null
      originNextSibling: Node | null
      removeEventListeners: (() => void) | null
    }

function isSelectableTag(tag: string) {
  return tag === 'IMG' || tag === 'VIDEO' || tag === 'IFRAME' || tag === 'TABLE'
}

function getIframeEl(wrapper: HTMLElement | null) {
  return wrapper?.querySelector<HTMLIFrameElement>('.tox-edit-area__iframe') ?? null
}

function getRangeFromPoint(doc: Document, x: number, y: number): Range | null {
  const anyDoc = doc as any
  if (typeof anyDoc.caretRangeFromPoint === 'function') {
    try {
      return anyDoc.caretRangeFromPoint(x, y) as Range | null
    } catch {
      return null
    }
  }
  if (typeof anyDoc.caretPositionFromPoint === 'function') {
    try {
      const pos = anyDoc.caretPositionFromPoint(x, y) as { offsetNode: Node; offset: number } | null
      if (!pos) return null
      const rng = doc.createRange()
      rng.setStart(pos.offsetNode, pos.offset)
      rng.collapse(true)
      return rng
    } catch {
      return null
    }
  }
  return null
}

function getSafeRange(editor: any, clientX: number, clientY: number): Range | null {
  const doc = editor?.getDoc?.() as Document | null
  if (!doc) return null
  const iframeRect = (doc.defaultView?.frameElement as HTMLIFrameElement | null)?.getBoundingClientRect?.()
  if (!iframeRect) return null

  const x = Math.max(0, Math.floor(clientX - iframeRect.left))
  const y = Math.max(0, Math.floor(clientY - iframeRect.top))
  let rng = getRangeFromPoint(doc, x, y)
  if (!rng) {
    try {
      const anyDoc = doc as any
      const stack: Element[] =
        typeof anyDoc.elementsFromPoint === 'function'
          ? (anyDoc.elementsFromPoint(x, y) as Element[])
          : ((anyDoc.elementFromPoint ? [anyDoc.elementFromPoint(x, y)] : []).filter(Boolean) as Element[])
      const cell = (stack.find(el => {
        const tag = (el as any)?.tagName?.toUpperCase?.()
        return tag === 'TD' || tag === 'TH'
      }) as HTMLElement | undefined) ?? null
      if (cell) {
        const r = doc.createRange()
        r.setStart(cell, Math.min(cell.childNodes.length, cell.childNodes.length))
        r.collapse(true)
        rng = r
      }
    } catch {}
    if (!rng) return null
  }

  const startNode = rng.startContainer
  const startEl = (startNode.nodeType === Node.ELEMENT_NODE ? (startNode as Element) : startNode.parentElement) as Element | null
  if (!startEl) return null

  const inTable = !!startEl.closest?.('table')
  const inCell = !!startEl.closest?.('td,th')
  if (inTable && !inCell) {
    try {
      const anyDoc = doc as any
      const stack: Element[] =
        typeof anyDoc.elementsFromPoint === 'function'
          ? (anyDoc.elementsFromPoint(x, y) as Element[])
          : ((anyDoc.elementFromPoint ? [anyDoc.elementFromPoint(x, y)] : []).filter(Boolean) as Element[])
      const cell = (stack.find(el => {
        const tag = (el as any)?.tagName?.toUpperCase?.()
        return tag === 'TD' || tag === 'TH'
      }) as HTMLElement | undefined) ?? null
      if (cell) {
        const r = doc.createRange()
        r.setStart(cell, Math.min(cell.childNodes.length, cell.childNodes.length))
        r.collapse(true)
        rng = r
      }
    } catch {}
  }

  const forbidden = startEl.closest('img,video,iframe,style') as HTMLElement | null
  if (!forbidden) return rng
  if (forbidden.tagName?.toUpperCase?.() === 'STYLE') {
    const after = doc.createRange()
    after.setStartAfter(forbidden)
    after.collapse(true)
    return after
  }

  const forbiddenRect = forbidden.getBoundingClientRect()
  const before = doc.createRange()
  const after = doc.createRange()
  before.setStartBefore(forbidden)
  before.collapse(true)
  after.setStartAfter(forbidden)
  after.collapse(true)

  const localY = clientY - iframeRect.top
  const mid = forbiddenRect.top + forbiddenRect.height / 2
  return localY > mid ? after : before
}

function normalizeDropRange(doc: Document, rng: Range): Range {
  const next = rng.cloneRange()
  const startNode = next.startContainer
  const startEl = (startNode.nodeType === Node.ELEMENT_NODE ? (startNode as Element) : startNode.parentElement) as Element | null
  const forbidden = startEl?.closest?.('img,video,iframe,style') as HTMLElement | null
  if (!forbidden) return next
  if (forbidden.tagName?.toUpperCase?.() === 'STYLE') {
    next.setStartAfter(forbidden)
    next.collapse(true)
    return next
  }

  const rect = forbidden.getBoundingClientRect()
  const mid = rect.top + rect.height / 2
  const r = next.getBoundingClientRect?.()
  const after = !!r && r.top > mid
  if (after) next.setStartAfter(forbidden)
  else next.setStartBefore(forbidden)
  next.collapse(true)
  return next
}

function getInsertionRect(doc: Document, rng: Range): DOMRect | null {
  const rect = rng.getBoundingClientRect()
  if (rect && (rect.width !== 0 || rect.height !== 0)) return rect
  const rects = rng.getClientRects?.()
  if (rects && rects.length > 0) return rects[0]

  const startNode = rng.startContainer
  const el = (startNode.nodeType === Node.ELEMENT_NODE ? (startNode as Element) : startNode.parentElement) as Element | null
  if (!el) return null
  const elRect = el.getBoundingClientRect()
  return elRect && (elRect.width !== 0 || elRect.height !== 0) ? elRect : null
}

function autoScrollDuringDrag(editor: any, clientY: number) {
  const doc = editor?.getDoc?.() as Document | null
  const win = editor?.getWin?.() as Window | null
  if (!doc || !win) return

  const iframeRect = (doc.defaultView?.frameElement as HTMLIFrameElement | null)?.getBoundingClientRect?.()
  if (!iframeRect) return

  const threshold = 36
  const y = clientY - iframeRect.top
  if (y < threshold) win.scrollBy(0, -12)
  else if (y > iframeRect.height - threshold) win.scrollBy(0, 12)
}

export function useDraggable(args: {
  wrapperRef: React.RefObject<HTMLDivElement>
  editorRef: React.RefObject<any>
  activeElRef: React.MutableRefObject<HTMLElement | null>
  positionOverlay: (el: HTMLElement | null) => void
}) {
  const DRAG_THRESHOLD = 5
  const ghostRef = useRef<HTMLDivElement>(null)
  const insertionRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState>(null)
  const argsRef = useRef(args)

  useEffect(() => {
    argsRef.current = args
  }, [args])

  const stopDragUi = useCallback(() => {
    if (ghostRef.current) ghostRef.current.style.display = 'none'
    if (insertionRef.current) insertionRef.current.style.display = 'none'
  }, [])

  const renderGhost = useCallback((clientX: number, clientY: number) => {
    const ghost = ghostRef.current
    const wrap = argsRef.current.wrapperRef.current
    const el = argsRef.current.activeElRef.current
    if (!ghost || !wrap || !el) return

    const wrapRect = wrap.getBoundingClientRect()
    const rect = el.getBoundingClientRect()
    const tag = el.tagName.toUpperCase()

    const left = clientX - wrapRect.left - rect.width / 2
    const top = clientY - wrapRect.top - rect.height / 2

    ghost.style.cssText = `
      display: block;
      position: absolute;
      left: ${Math.max(0, left)}px;
      top: ${Math.max(0, top)}px;
      width: ${Math.max(8, rect.width)}px;
      height: ${Math.max(8, rect.height)}px;
      z-index: 1002;
      pointer-events: none;
      opacity: 0.55;
      box-sizing: border-box;
      border: 2px solid #3b82f6;
      background: rgba(59, 130, 246, 0.08);
      border-radius: 6px;
    `

    if (tag === 'IMG') {
      const src = (el as HTMLImageElement).currentSrc || (el as HTMLImageElement).src
      if (src) {
        ghost.style.backgroundImage = `url("${src.replace(/"/g, '%22')}")`
        ghost.style.backgroundSize = 'cover'
        ghost.style.backgroundPosition = 'center'
        ghost.style.backgroundRepeat = 'no-repeat'
        ghost.style.backgroundColor = 'rgba(15, 23, 42, 0.06)'
      }
    } else {
      ghost.style.backgroundImage = ''
      ghost.style.backgroundSize = ''
      ghost.style.backgroundPosition = ''
      ghost.style.backgroundRepeat = ''
    }
  }, [])

  const renderInsertion = useCallback((rng: Range | null) => {
    const indicator = insertionRef.current
    const wrap = argsRef.current.wrapperRef.current
    const editor = argsRef.current.editorRef.current
    if (!indicator || !wrap || !editor) return
    if (!rng) {
      indicator.style.display = 'none'
      return
    }

    const doc = editor.getDoc?.() as Document | null
    if (!doc) {
      indicator.style.display = 'none'
      return
    }

    const rect = getInsertionRect(doc, rng)
    if (!rect) {
      indicator.style.display = 'none'
      return
    }

    const iframeEl = getIframeEl(wrap)
    if (!iframeEl) {
      indicator.style.display = 'none'
      return
    }
    const iframeRect = iframeEl.getBoundingClientRect()
    const wrapRect = wrap.getBoundingClientRect()

    const top = iframeRect.top - wrapRect.top + rect.top
    const left = iframeRect.left - wrapRect.left + rect.left
    const height = Math.max(14, rect.height || 14)

    indicator.style.cssText = `
      display: block;
      position: absolute;
      top: ${Math.max(0, top)}px;
      left: ${Math.max(0, left)}px;
      width: 2px;
      height: ${height}px;
      background: #3b82f6;
      z-index: 1003;
      pointer-events: none;
    `
  }, [])

  const tick = useCallback(() => {
    const st = dragRef.current
    const editor = argsRef.current.editorRef.current
    const el = argsRef.current.activeElRef.current
    if (!st || !st.active || !editor || !el) return

    autoScrollDuringDrag(editor, st.lastClientY)
    const rng = getSafeRange(editor, st.lastClientX, st.lastClientY)
    st.range = rng
    renderInsertion(rng)
    renderGhost(st.lastClientX, st.lastClientY)
  }, [renderGhost, renderInsertion])

  const toPageClient = useCallback((ev: PointerEvent) => {
    const editor = argsRef.current.editorRef.current
    const doc = editor?.getDoc?.() as Document | null
    const iframeRect = (doc?.defaultView?.frameElement as HTMLIFrameElement | null)?.getBoundingClientRect?.()
    if (!iframeRect) return { x: ev.clientX, y: ev.clientY }

    const target = ev.target as any
    const ownerDoc = (target?.ownerDocument ?? null) as Document | null
    const isFromIframeDoc = !!ownerDoc && ownerDoc !== window.document
    if (!isFromIframeDoc) return { x: ev.clientX, y: ev.clientY }
    return { x: iframeRect.left + ev.clientX, y: iframeRect.top + ev.clientY }
  }, [])

  const finalizeDrop = useCallback(() => {
    const editor = argsRef.current.editorRef.current
    const el = argsRef.current.activeElRef.current
    const st = dragRef.current
    if (!editor || !el || !st?.range) return

    const doc = editor.getDoc?.() as Document | null
    const body = editor.getBody?.() as HTMLElement | null
    if (!doc || !body) return
    if (!body.contains(el)) return

    const safe = normalizeDropRange(doc, st.range.cloneRange())
    if (el.contains(safe.startContainer)) return
    const tag = el.tagName.toUpperCase()
    const isBlockish = tag === 'VIDEO' || tag === 'IFRAME' || tag === 'TABLE'
    const marker = doc.createElement('span')
    marker.setAttribute('data-mce-bogus', '1')
    marker.appendChild(doc.createTextNode('\u200B'))

    try {
      editor.undoManager.transact(() => {
        const insertRng = safe.cloneRange()
        if (isBlockish) {
          const startNode = insertRng.startContainer
          const startEl = (startNode.nodeType === Node.ELEMENT_NODE ? (startNode as Element) : startNode.parentElement) as Element | null
          const host = (startEl?.closest?.('td,th,p,div,li,blockquote,pre,h1,h2,h3,h4,h5,h6,ul,ol') ?? body) as HTMLElement

          if (host === el) return

          const iframeRect = (doc.defaultView?.frameElement as HTMLIFrameElement | null)?.getBoundingClientRect?.()
          const hostRect = host.getBoundingClientRect?.()
          const hostMidAbs =
            iframeRect && hostRect
              ? (iframeRect.top + hostRect.top + hostRect.height / 2)
              : null

          const dropAfter = hostMidAbs != null ? (st.lastClientY > hostMidAbs) : true
          if (dropAfter) insertRng.setStartAfter(host)
          else insertRng.setStartBefore(host)
          insertRng.collapse(true)
        }

        insertRng.insertNode(marker)

        if (!marker.parentNode) return
        el.remove()
        marker.parentNode.insertBefore(el, marker)
        marker.remove()

        const next = doc.createRange()
        next.setStartAfter(el)
        next.collapse(true)
        editor.selection?.setRng?.(next)
      })
    } catch {
      try { marker.remove() } catch {}
      return
    }

    argsRef.current.activeElRef.current = el
    editor.selection?.select?.(el)
    editor.nodeChanged()
    editor.fire?.('Change')
    argsRef.current.positionOverlay(el)
  }, [])

  const startDrag = (e: PointerEvent, opts?: { immediate?: boolean; armOnly?: boolean }) => {
    const target = e.target as HTMLElement | null
    if (target?.dataset?.handle || target?.classList?.contains('resize-handle')) return

    const editor = argsRef.current.editorRef.current
    const el = argsRef.current.activeElRef.current
    const wrap = argsRef.current.wrapperRef.current
    if (!editor || !el || !wrap) return

    const tag = el.tagName.toUpperCase()
    if (!isSelectableTag(tag)) return

    editor.selection?.select?.(el)
    editor.focus?.()

    const { x: startX, y: startY } = toPageClient(e)

    const immediate = !!opts?.immediate
    const armOnly = !!opts?.armOnly
    if (immediate && !armOnly) {
      e.preventDefault()
      e.stopPropagation()
    }
    try {
      ;(target as any)?.setPointerCapture?.(e.pointerId)
    } catch {}

    dragRef.current = {
      pointerId: e.pointerId,
      active: immediate,
      hasExceededThreshold: immediate,
      startClientX: startX,
      startClientY: startY,
      range: null,
      lastClientX: startX,
      lastClientY: startY,
      rafId: null,
      removeScrollListener: null,
      originParent: null,
      originNextSibling: null,
      removeEventListeners: null,
    }

    const iframeWin = editor.getWin?.() as Window | null
    const primaryWin = iframeWin ?? window
    const secondaryWin = primaryWin === window ? null : window

    const onPointerMove = (ev: PointerEvent) => {
      const st = dragRef.current
      if (!st) return
      if (ev.pointerId !== st.pointerId) return

      const { x, y } = toPageClient(ev)
      st.lastClientX = x
      st.lastClientY = y

      if (!st.hasExceededThreshold) {
        const dx = x - st.startClientX
        const dy = y - st.startClientY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < DRAG_THRESHOLD) return

        ev.preventDefault()
        ev.stopPropagation()

        const editor = argsRef.current.editorRef.current
        if (editor) editor.undoManager.add()

        const doc = editor?.getDoc?.() as Document | null
        if (doc && !st.removeScrollListener) {
          const onScroll = () => {
            const cur = dragRef.current
            if (!cur?.active) return
            if (cur.rafId != null) return
            cur.rafId = window.requestAnimationFrame(() => {
              const x = dragRef.current
              if (!x) return
              x.rafId = null
              tick()
            })
          }
          doc.addEventListener('scroll', onScroll, { passive: true })
          st.removeScrollListener = () => doc.removeEventListener('scroll', onScroll as any)
        }

        st.hasExceededThreshold = true
        st.active = true
        const el = argsRef.current.activeElRef.current
        st.originParent = el?.parentNode ?? null
        st.originNextSibling = el?.nextSibling ?? null
        renderGhost(st.lastClientX, st.lastClientY)
        tick()
        return
      }

      if (!st.active) return
      ev.preventDefault()
      if (st.rafId != null) return
      st.rafId = window.requestAnimationFrame(() => {
        const cur = dragRef.current
        if (!cur) return
        cur.rafId = null
        tick()
      })
    }

    const onPointerUp = (ev: PointerEvent) => {
      const st = dragRef.current
      if (!st) return
      if (ev.pointerId !== st.pointerId) return

      const shouldFinalize = st.active && st.hasExceededThreshold
      st.active = false
      if (st.rafId != null) window.cancelAnimationFrame(st.rafId)
      st.rafId = null
      st.removeScrollListener?.()
      st.removeScrollListener = null
      st.removeEventListeners?.()
      st.removeEventListeners = null

      if (shouldFinalize) {
        const editor = argsRef.current.editorRef.current
        if (editor) {
          const { x, y } = toPageClient(ev)
          st.range = getSafeRange(editor, x, y)
        }
        finalizeDrop()
      }
      stopDragUi()
      dragRef.current = null
    }

    primaryWin.addEventListener('pointermove', onPointerMove)
    primaryWin.addEventListener('pointerup', onPointerUp)
    primaryWin.addEventListener('pointercancel', onPointerUp)
    secondaryWin?.addEventListener('pointermove', onPointerMove)
    secondaryWin?.addEventListener('pointerup', onPointerUp)
    secondaryWin?.addEventListener('pointercancel', onPointerUp)

    dragRef.current.removeEventListeners = () => {
      primaryWin.removeEventListener('pointermove', onPointerMove)
      primaryWin.removeEventListener('pointerup', onPointerUp)
      primaryWin.removeEventListener('pointercancel', onPointerUp)
      secondaryWin?.removeEventListener('pointermove', onPointerMove)
      secondaryWin?.removeEventListener('pointerup', onPointerUp)
      secondaryWin?.removeEventListener('pointercancel', onPointerUp)
    }

    if (immediate) {
      const editor = argsRef.current.editorRef.current
      if (editor) editor.undoManager.add()
      const curEl = argsRef.current.activeElRef.current
      dragRef.current.originParent = curEl?.parentNode ?? null
      dragRef.current.originNextSibling = curEl?.nextSibling ?? null
      renderGhost(startX, startY)
      tick()
    }

    return
  }

  return { startDrag, ghostRef, insertionRef }
}
