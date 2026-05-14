'use client'

import { useState, useEffect, useCallback, useMemo, useId, useRef } from 'react'
import { Editor as TinyMCEEditor } from '@tinymce/tinymce-react'
import DOMPurify from 'dompurify'
import debounce from 'lodash.debounce'
import { useTranslations } from 'next-intl'
import { useElementSelection, type SelectedKind } from './useElementSelection'
import { useDraggable } from './useDraggable'
import { useTableInteractions } from './useTableInteractions'

interface Props {
  label?: string
  value?: string
  onChange?: (html: string) => void
  autosaveKey?: string
  dir?: 'ltr' | 'rtl' | 'auto'
}

/* ─── YouTube URL → embed URL ─────────────────────────── */
function toYouTubeEmbed(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return `https://www.youtube.com/embed/${m[1]}`
  }
  return null
}

function useResizable<TPosition extends (el: HTMLElement | null) => void, TStart extends (dx: number, dy: number, e: PointerEvent) => void>(args: {
  positionOverlay: TPosition
  startResize: TStart
}) {
  return args
}

export default function RichTextEditor({
  label,
  value = '',
  onChange,
  autosaveKey,
  dir = 'ltr',
}: Props) {
  const t = useTranslations('AdminRichText')
  const tx = useCallback((key: string, fallback: string) => {
    try {
      return t(key as any)
    } catch {
      return fallback
    }
  }, [t])

  const KINT_RTE_PUBLIC_CSS = useMemo(() => {
    return `
      table {
        border-collapse: collapse;
        border: 1px solid #64748b;
        max-width: 100%;
      }
      table:not([width]):not([style*="width"]) {
        width: 100%;
      }
      tbody, thead, tfoot, tr, th, td {
        border-color: inherit;
        border-style: inherit;
        border-width: inherit;
      }
      table[width], table[style*="width"] {
        table-layout: fixed;
      }
      table th, table td {
        padding: 10px 12px;
        vertical-align: top;
        word-break: break-word;
        overflow-wrap: anywhere;
      }
      table th p, table td p {
        margin: 0 !important;
      }
      table th {
        background: #f8fafc;
        font-weight: 700;
      }

      img {
        max-width: 100%;
        height: auto;
      }
      video, iframe {
        max-width: 100%;
      }
      video:not([height]):not([style*="height"]),
      iframe:not([height]):not([style*="height"]) {
        height: auto;
      }
      video, iframe {
        display: block;
        margin: 0.5rem auto;
      }

      img.kint-wrap-left, video.kint-wrap-left, iframe.kint-wrap-left {
        float: left;
        margin: 0 1rem 0.5rem 0;
        max-width: 45%;
      }
      img.kint-wrap-right, video.kint-wrap-right, iframe.kint-wrap-right {
        float: right;
        margin: 0 0 0.5rem 1rem;
        max-width: 45%;
      }
      img.kint-wrap-tight-left, video.kint-wrap-tight-left, iframe.kint-wrap-tight-left {
        float: left;
        margin: 0 0.6rem 0.35rem 0;
        max-width: 45%;
        shape-outside: margin-box;
      }
      img.kint-wrap-tight-right, video.kint-wrap-tight-right, iframe.kint-wrap-tight-right {
        float: right;
        margin: 0 0 0.35rem 0.6rem;
        max-width: 45%;
        shape-outside: margin-box;
      }
      img.kint-wrap-inline, video.kint-wrap-inline, iframe.kint-wrap-inline {
        float: none;
        margin: 0;
        max-width: 100%;
      }

      img.kint-wrap-left,
      img.kint-wrap-right,
      img.kint-wrap-tight-left,
      img.kint-wrap-tight-right {
        height: auto;
      }
      video.kint-wrap-left:not([height]):not([style*="height"]),
      video.kint-wrap-right:not([height]):not([style*="height"]),
      video.kint-wrap-tight-left:not([height]):not([style*="height"]),
      video.kint-wrap-tight-right:not([height]):not([style*="height"]),
      iframe.kint-wrap-left:not([height]):not([style*="height"]),
      iframe.kint-wrap-right:not([height]):not([style*="height"]),
      iframe.kint-wrap-tight-left:not([height]):not([style*="height"]),
      iframe.kint-wrap-tight-right:not([height]):not([style*="height"]) {
        height: auto;
      }

      .kint-behind-container {
        position: relative;
        z-index: 0;
      }
      .kint-behind-container img.kint-wrap-behind,
      .kint-behind-container video.kint-wrap-behind,
      .kint-behind-container iframe.kint-wrap-behind {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 0;
        pointer-events: none;
      }
      .kint-behind-container > :not(img.kint-wrap-behind):not(video.kint-wrap-behind):not(iframe.kint-wrap-behind) {
        position: relative;
        z-index: 1;
      }
      img.kint-wrap-behind, video.kint-wrap-behind, iframe.kint-wrap-behind {
        opacity: 0.35;
        mix-blend-mode: multiply;
      }
      video.kint-aspect-unlocked, iframe.kint-aspect-unlocked {
        outline-style: dashed;
      }
    `.trim()
  }, [])

  const ensurePublicRteStyles = useCallback((html: string) => {
    if (!html) return html
    const styleTag = `<style data-kint-rte="1">${KINT_RTE_PUBLIC_CSS}</style>`
    const re = /<style\b[^>]*data-kint-rte=(["'])1\1[^>]*>[\s\S]*?<\/style>/i
    if (re.test(html)) return html.replace(re, styleTag)
    return styleTag + html
  }, [KINT_RTE_PUBLIC_CSS])

  const stripPublicRteStyles = useCallback((html: string) => {
    if (!html) return html
    const re = /<style\b[^>]*data-kint-rte=(["'])1\1[^>]*>[\s\S]*?<\/style>/i
    return html.replace(re, '')
  }, [])
  const [localContent, setLocalContent] = useState<string>(value || '')
  const [stats, setStats] = useState({ words: 0, chars: 0, lines: 1 })
  const [editorLoadError, setEditorLoadError] = useState<string | null>(null)
  const editorValue = onChange ? value : localContent
  const editorDisplayValue = useMemo(() => stripPublicRteStyles(editorValue), [editorValue, stripPublicRteStyles])
  const fontNameInputId = useId(); // Generate a unique ID
  const wrapperRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<any>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const shieldRef = useRef<HTMLDivElement>(null)
  const behindSelectBtnRef = useRef<HTMLButtonElement>(null)
  const behindSelectTargetRef = useRef<HTMLElement | null>(null)
  const isOverOverlayRef = useRef(false)  // true while mouse is over the resize handles

  type InteractionState =
    | null
    | {
        type: 'resize'
        kind: SelectedKind
        pointerId: number
        dx: number
        dy: number
        startClientX: number
        startClientY: number
        startW: number
        startH: number
        startMarginLeft: number
        startMarginTop: number
        startOverlayLeft: number
        startOverlayTop: number
        editorLeft: number
        editorTop: number
        editorRight: number
        editorBottom: number
        lockAspect: boolean
        hasExceededThreshold: boolean
        tableRowHeights: number[] | null
        tableColWidths: number[] | null
      }

  const interactionRef = useRef<InteractionState>(null)
  const isInteractingRef = useRef(false)

  type HandleType =
    | 'top-left'
    | 'top'
    | 'top-right'
    | 'right'
    | 'bottom-right'
    | 'bottom'
    | 'bottom-left'
    | 'left'

  type HandlePosition = { type: HandleType; x: number; y: number }
  type RectLike = { left: number; top: number; width: number; height: number; right: number; bottom: number }

  const calculateHandlePositions = useCallback(
    (elementRect: RectLike, editorRect: RectLike, handleSize: number): HandlePosition[] => {
      const halfHandle = handleSize / 2

      const positions: HandlePosition[] = [
        { type: 'top-left', x: elementRect.left, y: elementRect.top }, // NW (0)
        { type: 'top', x: elementRect.left + elementRect.width / 2, y: elementRect.top }, // N (1)
        { type: 'top-right', x: elementRect.left + elementRect.width, y: elementRect.top }, // NE (2)
        { type: 'left', x: elementRect.left, y: elementRect.top + elementRect.height / 2 }, // W (3)
        { type: 'right', x: elementRect.left + elementRect.width, y: elementRect.top + elementRect.height / 2 }, // E (4)
        { type: 'bottom-left', x: elementRect.left, y: elementRect.top + elementRect.height }, // SW (5)
        { type: 'bottom', x: elementRect.left + elementRect.width / 2, y: elementRect.top + elementRect.height }, // S (6)
        { type: 'bottom-right', x: elementRect.left + elementRect.width, y: elementRect.top + elementRect.height }, // SE (7)
      ]

      const minX = editorRect.left + halfHandle
      const maxX = editorRect.right - halfHandle
      const minY = editorRect.top + halfHandle
      const maxY = editorRect.bottom - halfHandle

      for (const pos of positions) {
        pos.x = Math.max(minX, Math.min(pos.x, maxX))
        pos.y = Math.max(minY, Math.min(pos.y, maxY))
      }

      return positions
    },
    []
  )

  const updateStats = useCallback((html: string) => {
    const withoutStyles = html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    const plain = withoutStyles.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    const words = plain ? plain.split(' ').length : 0
    const chars = plain.length
    const lines = Math.max(1, html.split(/\n|<br\s*\/?>/i).length)
    setStats({ words, chars, lines })
  }, [])

  const normalizeTableHtml = useCallback((html: string) => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')

      const colEls = Array.from(doc.querySelectorAll('table col')) as HTMLElement[]
      for (const col of colEls) {
        const style = col.getAttribute('style') || ''
        const m = style.match(/(?:^|;)\s*width\s*:\s*([^;]+)\s*(?:;|$)/i)
        const w = m?.[1]?.trim()
        if (w) {
          col.setAttribute('width', w)
          const nextStyle = style
            .split(';')
            .map(s => s.trim())
            .filter(Boolean)
            .filter(s => !/^width\s*:/i.test(s))
            .join(';')
          if (nextStyle) col.setAttribute('style', nextStyle)
          else col.removeAttribute('style')
        }
      }

      const cells = Array.from(doc.querySelectorAll('table td[style], table th[style]')) as HTMLElement[]
      for (const cell of cells) {
        const style = cell.getAttribute('style') || ''
        const m = style.match(/(?:^|;)\s*height\s*:\s*([0-9.]+)px\s*(?:;|$)/i)
        const h = m?.[1]?.trim()
        if (h) {
          cell.setAttribute('height', String(Math.round(parseFloat(h))))
          const nextStyle = style
            .split(';')
            .map(s => s.trim())
            .filter(Boolean)
            .filter(s => !/^height\s*:/i.test(s))
            .join(';')
          if (nextStyle) cell.setAttribute('style', nextStyle)
          else cell.removeAttribute('style')
        }
      }

      return doc.body.innerHTML
    } catch {
      return html
    }
  }, [])

  const normalizeBehindHtml = useCallback((html: string) => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')

      const mediaEls = Array.from(doc.querySelectorAll('img.kint-wrap-behind,video.kint-wrap-behind,iframe.kint-wrap-behind')) as HTMLElement[]
      if (mediaEls.length === 0) return html

      const isTextyBlock = (el: Element | null) => {
        if (!(el instanceof HTMLElement)) return false
        const tag = el.tagName.toUpperCase()
        if (tag !== 'P' && tag !== 'DIV' && tag !== 'LI' && tag !== 'TD' && tag !== 'TH' && tag !== 'FIGURE') return false
        return (el.textContent || '').trim().length > 0
      }

      const isMediaOnlyBlock = (block: HTMLElement, media: HTMLElement) => {
        const hasText = (block.textContent || '').trim().length > 0
        if (hasText) return false
        const nonBr = Array.from(block.querySelectorAll('*:not(br)')) as HTMLElement[]
        if (nonBr.length !== 1) return false
        return nonBr[0] === media
      }

      for (const media of mediaEls) {
        const block = media.closest('p,div,li,td,th,figure') as HTMLElement | null
        if (!block) continue

        if (block.classList.contains('kint-behind-container')) continue

        if (isMediaOnlyBlock(block, media)) {
          const next = block.nextElementSibling
          const prev = block.previousElementSibling
          const sibling = (isTextyBlock(next) ? (next as HTMLElement) : (isTextyBlock(prev) ? (prev as HTMLElement) : null))
          const parent = block.parentElement
          if (parent && sibling) {
            const wrapper = doc.createElement('div')
            wrapper.className = 'kint-behind-container'
            parent.insertBefore(wrapper, block)
            wrapper.appendChild(media)
            block.remove()
            wrapper.appendChild(sibling)
          } else {
            block.classList.add('kint-behind-container')
            block.insertBefore(media, block.firstChild)
          }
        } else {
          block.classList.add('kint-behind-container')
          block.insertBefore(media, block.firstChild)
        }
      }

      return doc.body.innerHTML
    } catch {
      return html
    }
  }, [])

  const autosave = useMemo(
    () =>
      debounce((html: string) => {
        if (autosaveKey) localStorage.setItem(autosaveKey, html)
      }, 800),
    [autosaveKey]
  )

  /* ── Show/hide the selection overlay at the exact element position ── */
  const positionOverlay = useCallback((el: HTMLElement | null) => {
    const overlay = overlayRef.current
    if (!overlay) return

    if (!el || !wrapperRef.current) {
      if (!isOverOverlayRef.current) {
        overlay.style.display = 'none'
      }
      return
    }

    const iframeEl = wrapperRef.current.querySelector<HTMLIFrameElement>('.tox-edit-area__iframe')
    if (!iframeEl) { overlay.style.display = 'none'; return }

    const iframeRect = iframeEl.getBoundingClientRect()
    const wrapRect = wrapperRef.current.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()

    const top = iframeRect.top - wrapRect.top + elRect.top
    const left = iframeRect.left - wrapRect.left + elRect.left
    const width = elRect.width
    const height = elRect.height

    const tag = el.tagName.toUpperCase()
    const kind: SelectedKind =
      tag === 'IMG' ? 'img' :
      tag === 'VIDEO' ? 'video' :
      tag === 'IFRAME' ? 'iframe' : 'table'

    overlay.style.cssText = `
      display: block;
      position: absolute;
      top: ${top}px; left: ${left}px;
      width: ${width}px; height: ${height}px;
      outline: 2px solid #3b82f6;
      pointer-events: none;
      z-index: 999;
    `
    overlay.style.willChange = 'top,left,width,height,clip-path'

    const HANDLE_SIZE = 10
    const HALF = HANDLE_SIZE / 2
    const handles = overlay.querySelectorAll<HTMLDivElement>('[data-handle]')
    const dragHandle = overlay.querySelector<HTMLDivElement>('[data-drag-handle]')
    handles.forEach((h) => { h.style.display = 'block' })

    if (dragHandle) {
      dragHandle.style.display = 'block'
      dragHandle.style.top = (-20) + 'px'
      dragHandle.style.left = (-20) + 'px'
    }

    const editorTop = iframeRect.top - wrapRect.top
    const editorLeft = iframeRect.left - wrapRect.left
    const editorRect: RectLike = {
      left: editorLeft,
      top: editorTop,
      width: iframeRect.width,
      height: iframeRect.height,
      right: editorLeft + iframeRect.width,
      bottom: editorTop + iframeRect.height,
    }
    const elementRect: RectLike = {
      left,
      top,
      width,
      height,
      right: left + width,
      bottom: top + height,
    }

    const completelyOutside =
      elementRect.right < editorRect.left ||
      elementRect.left > editorRect.right ||
      elementRect.bottom < editorRect.top ||
      elementRect.top > editorRect.bottom
    if (completelyOutside) {
      overlay.style.display = 'none'
      return
    }

    const clipTop = Math.max(0, editorRect.top - elementRect.top)
    const clipLeft = Math.max(0, editorRect.left - elementRect.left)
    const clipRight = Math.max(0, elementRect.right - editorRect.right)
    const clipBottom = Math.max(0, elementRect.bottom - editorRect.bottom)
    const clip = `inset(${clipTop}px ${clipRight}px ${clipBottom}px ${clipLeft}px)`
    overlay.style.clipPath = clip
    ;(overlay.style as any).webkitClipPath = clip
    const positions = calculateHandlePositions(elementRect, editorRect, HANDLE_SIZE)

    handles.forEach((h, i) => {
      const p = positions[i]
      const handleLeft = p.x - elementRect.left - HALF
      const handleTop = p.y - elementRect.top - HALF
      h.style.top = handleTop + 'px'
      h.style.left = handleLeft + 'px'
      h.style.removeProperty('right')
      h.style.removeProperty('bottom')
    })
  }, [calculateHandlePositions])

  const updateOverlayFromRect = useCallback((args: {
    left: number
    top: number
    width: number
    height: number
    kind: SelectedKind
    editorLeft: number
    editorTop: number
    editorRight: number
    editorBottom: number
  }) => {
    const overlay = overlayRef.current
    if (!overlay) return

    overlay.style.display = 'block'
    overlay.style.position = 'absolute'
    overlay.style.top = `${args.top}px`
    overlay.style.left = `${args.left}px`
    overlay.style.width = `${args.width}px`
    overlay.style.height = `${args.height}px`
    overlay.style.outline = '2px solid #3b82f6'
    overlay.style.pointerEvents = 'none'
    overlay.style.zIndex = '999'

    const HANDLE_SIZE = 10
    const HALF = HANDLE_SIZE / 2
    const handles = overlay.querySelectorAll<HTMLDivElement>('[data-handle]')
    handles.forEach((h) => { h.style.display = 'block' })

    const editorRect: RectLike = {
      left: args.editorLeft,
      top: args.editorTop,
      width: args.editorRight - args.editorLeft,
      height: args.editorBottom - args.editorTop,
      right: args.editorRight,
      bottom: args.editorBottom,
    }
    const elementRect: RectLike = {
      left: args.left,
      top: args.top,
      width: args.width,
      height: args.height,
      right: args.left + args.width,
      bottom: args.top + args.height,
    }

    const clipTop = Math.max(0, editorRect.top - elementRect.top)
    const clipLeft = Math.max(0, editorRect.left - elementRect.left)
    const clipRight = Math.max(0, elementRect.right - editorRect.right)
    const clipBottom = Math.max(0, elementRect.bottom - editorRect.bottom)
    const clip = `inset(${clipTop}px ${clipRight}px ${clipBottom}px ${clipLeft}px)`
    overlay.style.clipPath = clip
    ;(overlay.style as any).webkitClipPath = clip

    const positions = calculateHandlePositions(elementRect, editorRect, HANDLE_SIZE)
    handles.forEach((h, i) => {
      const p = positions[i]
      const handleLeft = p.x - elementRect.left - HALF
      const handleTop = p.y - elementRect.top - HALF
      h.style.top = handleTop + 'px'
      h.style.left = handleLeft + 'px'
      h.style.removeProperty('right')
      h.style.removeProperty('bottom')
    })
  }, [calculateHandlePositions])

  const updateBehindSelectButton = useCallback(() => {
    const btn = behindSelectBtnRef.current
    const wrap = wrapperRef.current
    const editor = editorRef.current
    if (!btn || !wrap || !editor) return

    const iframeEl = wrap.querySelector<HTMLIFrameElement>('.tox-edit-area__iframe')
    if (!iframeEl) {
      btn.style.display = 'none'
      behindSelectTargetRef.current = null
      return
    }

    const node = editor.selection?.getNode?.() as HTMLElement | null
    const container = node?.closest?.('.kint-behind-container') as HTMLElement | null
    const media = container?.querySelector?.('img.kint-wrap-behind,video.kint-wrap-behind,iframe.kint-wrap-behind') as HTMLElement | null

    if (!container || !media) {
      btn.style.display = 'none'
      behindSelectTargetRef.current = null
      return
    }

    behindSelectTargetRef.current = media

    const iframeRect = iframeEl.getBoundingClientRect()
    const wrapRect = wrap.getBoundingClientRect()
    const cRect = container.getBoundingClientRect()

    const rawTop = iframeRect.top - wrapRect.top + cRect.top
    const rawLeft = iframeRect.left - wrapRect.left + cRect.left

    btn.style.display = 'block'
    btn.style.position = 'absolute'
    btn.style.zIndex = '1003'
    btn.style.pointerEvents = 'all'

    const minTop = iframeRect.top - wrapRect.top
    const minLeft = iframeRect.left - wrapRect.left
    const btnW = btn.offsetWidth || 140
    const btnH = btn.offsetHeight || 26
    const maxLeft = minLeft + iframeRect.width - btnW - 6
    const maxTop = minTop + iframeRect.height - btnH - 6

    const desiredTop = rawTop - btnH - 6
    const desiredLeft = rawLeft

    btn.style.top = `${Math.max(minTop + 6, Math.min(desiredTop, maxTop))}px`
    btn.style.left = `${Math.max(minLeft + 6, Math.min(desiredLeft, maxLeft))}px`
  }, [])

  const elementSelection = useElementSelection({ wrapperRef, positionOverlay })
  const draggable = useDraggable({
    wrapperRef,
    editorRef,
    activeElRef: elementSelection.activeElRef,
    positionOverlay,
  })
  const tableInteractions = useTableInteractions({ wrapperRef })

  /* ── Stable Global Listeners for Resizing ── */
  useEffect(() => {
    let rafId: number | null = null
    const RESIZE_THRESHOLD = 2
    let lastMove:
      | null
      | {
          clientX: number
          clientY: number
          pointerId: number
          pointerType: string
          buttons: number
        } = null

    const onMove = (ev: PointerEvent) => {
      if (!isInteractingRef.current) return
      lastMove = {
        clientX: ev.clientX,
        clientY: ev.clientY,
        pointerId: ev.pointerId,
        pointerType: ev.pointerType,
        buttons: ev.buttons,
      }
      if (rafId) return

      rafId = requestAnimationFrame(() => {
        rafId = null
        const snapshot = lastMove
        if (!snapshot) return
        const editor = editorRef.current
        const interaction = interactionRef.current
        const el = elementSelection.activeElRef.current
        if (!el || !interaction || interaction.type !== 'resize') return
        if (snapshot.pointerId !== interaction.pointerId) return
        if (snapshot.pointerType === 'mouse' && snapshot.buttons === 0) {
          onUp()
          return
        }

        const { dx, dy, startClientX, startClientY, startW, startH, lockAspect, kind } = interaction
        const deltaX = snapshot.clientX - startClientX
        const deltaY = snapshot.clientY - startClientY

        if (!interaction.hasExceededThreshold) {
          const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
          if (dist < RESIZE_THRESHOLD) return
          interaction.hasExceededThreshold = true
        }

        const isTable = kind === 'table'
        let newW = startW
        let newH = startH

        if (dx === 1) newW = Math.max(20, startW + deltaX)
        else if (dx === -1) newW = Math.max(20, startW - deltaX)

        if (dy === 1) newH = Math.max(20, startH + deltaY)
        else if (dy === -1) newH = Math.max(20, startH - deltaY)

        if (lockAspect && !isTable) {
          const ratio = startH > 0 ? (startW / startH) : 1
          const dW = Math.abs(newW - startW)
          const dH = Math.abs(newH - startH)
          if (dW >= dH) newH = Math.max(20, Math.round(newW / ratio))
          else newW = Math.max(20, Math.round(newH * ratio))
        }

        if (editor) {
          if (dx !== 0) editor.dom.setStyle(el, 'width', newW + 'px')
          if (dy !== 0 || (lockAspect && !isTable)) editor.dom.setStyle(el, 'height', newH + 'px')

          if (isTable) {
            editor.dom.setStyle(el, 'table-layout', 'fixed')
            if (dx === -1) editor.dom.setStyle(el, 'margin-left', `${interaction.startMarginLeft + (startW - newW)}px`)
            if (dy === -1) editor.dom.setStyle(el, 'margin-top', `${interaction.startMarginTop + (startH - newH)}px`)

            if (dx !== 0) {
              const cols = Array.from(el.querySelectorAll('col')) as HTMLElement[]
              const baseColWidths = interaction.tableColWidths
              if (cols.length > 0 && baseColWidths && baseColWidths.length === cols.length && startW > 0) {
                const scale = Math.max(0.05, newW / startW)
                for (let i = 0; i < cols.length; i++) {
                  const w0 = baseColWidths[i] || 0
                  const w = Math.max(16, Math.round(w0 * scale))
                  editor.dom.setStyle(cols[i], 'width', `${w}px`)
                }
              }
            }
            if (dy !== 0) {
              const rows = Array.from(el.querySelectorAll('tr')) as HTMLElement[]
              const baseHeights = interaction.tableRowHeights
              if (rows.length > 0 && baseHeights && baseHeights.length === rows.length && startH > 0) {
                const scale = Math.max(0.1, newH / startH)
                for (let i = 0; i < rows.length; i++) {
                  const h0 = baseHeights[i] || 0
                  const h = Math.max(8, Math.round(h0 * scale))
                  editor.dom.setStyle(rows[i], 'height', `${h}px`)
                }
              }
            }
          } else {
            if (dx === -1) editor.dom.setStyle(el, 'margin-left', `${interaction.startMarginLeft + (startW - newW)}px`)
            if (dy === -1) editor.dom.setStyle(el, 'margin-top', `${interaction.startMarginTop + (startH - newH)}px`)
          }
        } else {
          if (dx !== 0) el.style.width = newW + 'px'
          if (dy !== 0 || (lockAspect && !isTable)) el.style.height = newH + 'px'
          if (!isTable) {
            if (dx === -1) el.style.marginLeft = `${interaction.startMarginLeft + (startW - newW)}px`
            if (dy === -1) el.style.marginTop = `${interaction.startMarginTop + (startH - newH)}px`
          }
        }

        const overlayLeft = interaction.startOverlayLeft + (dx === -1 ? (startW - newW) : 0)
        const overlayTop = interaction.startOverlayTop + (dy === -1 ? (startH - newH) : 0)
        updateOverlayFromRect({
          left: overlayLeft,
          top: overlayTop,
          width: newW,
          height: newH,
          kind: interaction.kind,
          editorLeft: interaction.editorLeft,
          editorTop: interaction.editorTop,
          editorRight: interaction.editorRight,
          editorBottom: interaction.editorBottom,
        })
      })
    }

    const onUp = () => {
      if (!isInteractingRef.current) return
      const interaction = interactionRef.current
      const el = elementSelection.activeElRef.current
      isInteractingRef.current = false
      interactionRef.current = null
      if (rafId) cancelAnimationFrame(rafId)
      if (shieldRef.current) shieldRef.current.style.display = 'none'

      const editor = editorRef.current
      if (editor) {
        if (el && interaction && interaction.type === 'resize') {
          const rect = el.getBoundingClientRect()
          if (interaction.kind === 'table') {
            editor.dom.setStyle(el, 'width', `${Math.round(rect.width)}px`)
            editor.dom.setStyle(el, 'height', `${Math.round(rect.height)}px`)
            editor.dom.setAttrib(el, 'width', String(Math.round(rect.width)))
            editor.dom.setAttrib(el, 'height', String(Math.round(rect.height)))
                const cols = Array.from(el.querySelectorAll('col')) as HTMLElement[]
                cols.forEach((col) => {
                  const w = col.style.width || ''
                  const m = w.match(/([0-9.]+)px/)
                  if (!m) return
                  col.setAttribute('width', String(Math.round(parseFloat(m[1]))))
                })
          } else {
            if (interaction.dx !== 0) editor.dom.setAttrib(el, 'width', String(Math.round(rect.width)))
            if (interaction.dy !== 0 || interaction.lockAspect) editor.dom.setAttrib(el, 'height', String(Math.round(rect.height)))
          }
          if (el.classList.contains('kint-wrap-behind')) {
            const container = el.closest('p,div,li,td,th,figure') as HTMLElement | null
            if (container) {
              container.classList.add('kint-behind-container')
              editor.dom.setStyle(container, 'position', 'relative')
              editor.dom.setStyle(container, 'z-index', '0')
              editor.dom.setStyle(el, 'position', 'absolute')
              editor.dom.setStyle(el, 'left', '0')
              editor.dom.setStyle(el, 'top', '0')
              editor.dom.setStyle(el, 'z-index', '0')
              container.style.removeProperty('min-height')
            }
          }
        }
        editor.undoManager.add()
        editor.fire('Change')
        const html = normalizeBehindHtml(editor.getContent())
        let clean = DOMPurify.sanitize(html, {
          ADD_TAGS: ['video', 'source', 'iframe', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'colgroup', 'col', 'span', 'font', 'style'],
          ADD_ATTR: [
            'controls', 'width', 'height', 'src', 'allow', 'allowfullscreen', 'frameborder',
            'data-type', 'type', 'style', 'colspan', 'rowspan', 'data-float',
            'data-border-color', 'data-border-width', 'border', 'cellpadding', 'cellspacing',
            'class', 'id', 'dir', 'lang', 'color', 'bgcolor', 'align', 'valign', 'face', 'size',
            'data-mce-style', 'data-mce-selected', 'data-mce-href', 'data-mce-src', 'data-mce-bogus'
          ],
          PARSER_MEDIA_TYPE: 'text/html',
          FORCE_BODY: false,
          WHOLE_DOCUMENT: false,
        })
        clean = ensurePublicRteStyles(clean)
        if (onChange) onChange(clean)
        else setLocalContent(clean)
        updateStats(clean)
        autosave(clean)
      }
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [onChange, updateStats, autosave, elementSelection, updateOverlayFromRect, ensurePublicRteStyles, normalizeBehindHtml])

  const startResize = useCallback((dx: number, dy: number, e: PointerEvent) => {
    const target = e.target as HTMLElement | null
    if (!target?.dataset?.handle && !target?.classList?.contains('resize-handle')) return
    try {
      target.setPointerCapture?.(e.pointerId)
    } catch {}
    e.preventDefault()
    e.stopPropagation()

    const el = elementSelection.activeElRef.current
    if (!el) return

    const tag = el.tagName.toUpperCase()
    const kind: SelectedKind =
      tag === 'IMG' ? 'img' :
      tag === 'VIDEO' ? 'video' :
      tag === 'IFRAME' ? 'iframe' : 'table'

    const isCorner = dx !== 0 && dy !== 0
    const isVideoish = kind === 'video' || kind === 'iframe'
    const unlockedAspect = isVideoish && el.classList.contains('kint-aspect-unlocked')

    const style = window.getComputedStyle(el)
    const startMarginLeft = Number.isFinite(parseFloat(style.marginLeft)) ? parseFloat(style.marginLeft) : 0
    const startMarginTop = Number.isFinite(parseFloat(style.marginTop)) ? parseFloat(style.marginTop) : 0

    const wrap = wrapperRef.current
    const iframeEl = wrap?.querySelector<HTMLIFrameElement>('.tox-edit-area__iframe') ?? null
    const wrapRect = wrap?.getBoundingClientRect()
    const iframeRect = iframeEl?.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()

    const startOverlayLeft = iframeRect && wrapRect ? iframeRect.left - wrapRect.left + elRect.left : 0
    const startOverlayTop = iframeRect && wrapRect ? iframeRect.top - wrapRect.top + elRect.top : 0
    const editorLeft = iframeRect && wrapRect ? iframeRect.left - wrapRect.left : 0
    const editorTop = iframeRect && wrapRect ? iframeRect.top - wrapRect.top : 0
    const editorRight = iframeRect ? editorLeft + iframeRect.width : (wrap?.clientWidth ?? 0)
    const editorBottom = iframeRect ? editorTop + iframeRect.height : (wrap?.clientHeight ?? 0)

    const startW = elRect.width || el.clientWidth || 100
    const startH = elRect.height || el.clientHeight || 100

    isInteractingRef.current = true
    interactionRef.current = {
      type: 'resize',
      kind,
      pointerId: e.pointerId,
      dx,
      dy,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startW,
      startH,
      startMarginLeft,
      startMarginTop,
      startOverlayLeft,
      startOverlayTop,
      editorLeft,
      editorTop,
      editorRight,
      editorBottom,
      lockAspect: isCorner && !unlockedAspect && kind !== 'table',
      hasExceededThreshold: false,
      tableRowHeights: kind === 'table'
        ? Array.from(el.querySelectorAll('tr')).map((r) => {
            const rr = (r as HTMLElement).getBoundingClientRect()
            return Math.max(0, rr.height || (r as HTMLElement).offsetHeight || 0)
          })
        : null,
        tableColWidths: kind === 'table'
          ? Array.from(el.querySelectorAll('col')).map((c) => {
              const cr = (c as HTMLElement).getBoundingClientRect()
              return Math.max(0, cr.width || (c as HTMLElement).offsetWidth || 0)
            })
          : null,
    }

    const editor = editorRef.current
    if (editor) {
      editor.selection?.select?.(el)
      editor.focus?.()
      editor.undoManager.add()
    }

    if (shieldRef.current) {
      shieldRef.current.style.display = 'block'
      const cursor = window.getComputedStyle(e.target as Element).cursor
      shieldRef.current.style.cursor = cursor || 'nwse-resize'
    }
  }, [elementSelection])

  const resizable = useResizable({ positionOverlay, startResize })

  /* ── Custom font upload state ── */
  const [customFonts, setCustomFonts] = useState<{ name: string; url: string }[]>([])
  const [isUploadingFont, setIsUploadingFont] = useState(false)

  useEffect(() => {
    fetch('/api/fonts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCustomFonts(data)
      })
      .catch(console.error)
  }, [])

  const uploadAsset = useCallback(async (file: Blob, fileName = 'upload-file', folder = 'uploads') => {
    const formData = new FormData()
    formData.append('file', file, fileName)
    formData.append('folder', folder)
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) throw new Error('Upload failed')
    const data = await response.json() as { url?: string }
    if (!data?.url) throw new Error('Invalid upload response')
    return data.url
  }, [])

  useEffect(() => {
    // Add DOMPurify hook when component mounts
    DOMPurify.addHook('uponSanitizeAttribute' as any, function (node: Node, attr: Attr | null) {
      if (!attr) return; // Add null check for attr
      if (attr.name === 'style') {
        const nodeName = node.nodeName.toLowerCase();
        const isMedia = nodeName === 'img' || nodeName === 'video' || nodeName === 'iframe';
        const isTableish =
          nodeName === 'table' ||
          nodeName === 'colgroup' ||
          nodeName === 'col' ||
          nodeName === 'tbody' ||
          nodeName === 'thead' ||
          nodeName === 'tfoot' ||
          nodeName === 'tr' ||
          nodeName === 'td' ||
          nodeName === 'th'
        const el = node instanceof Element ? node : null
        const isBehindMedia = !!el?.classList?.contains('kint-wrap-behind')
        const isBehindContainer = !!el?.classList?.contains('kint-behind-container')

        let forbiddenLayoutStyles = [
          'position', 'z-index', 'float', 'clear', 'transform',
          'top', 'bottom', 'left', 'right',
          'display'
        ];

        if (isBehindMedia || isBehindContainer) {
          forbiddenLayoutStyles = forbiddenLayoutStyles.filter(p => p !== 'position' && p !== 'z-index' && p !== 'top' && p !== 'bottom' && p !== 'left' && p !== 'right')
        }

        if (!isMedia && !isTableish) {
          forbiddenLayoutStyles.push('width', 'height', 'min-width', 'min-height', 'max-width', 'max-height');
        }

        attr.value = attr.value.split(';').filter((s: string) => {
          const prop = s.split(':')[0].trim().toLowerCase();
          // Use exact match to avoid stripping 'padding-top' when 'top' is forbidden
          return !forbiddenLayoutStyles.some(fs => prop === fs);
        }).join(';');
      }
    });

    // Clean up the hook when the component unmounts
    return () => {
      autosave.cancel()
      DOMPurify.removeHook('uponSanitizeAttribute');
    }
  }, [autosave])

  /* ─── Build @font-face CSS for custom uploaded fonts ─── */
  const customFontCss = customFonts.map(f => {
    const ext = f.url.split('.').pop()?.toLowerCase() || 'ttf'
    const formats: Record<string, string> = {
      'ttf': 'truetype',
      'otf': 'opentype',
      'woff': 'woff',
      'woff2': 'woff2',
    }
    const format = formats[ext] || 'truetype'
    return `@font-face { font-family: '${f.name}'; src: url('${f.url}') format('${format}'); font-display: swap; } `
  }).join('')

  /* ─── List of font families including custom ones ─── */
  const fontFamilyFormats = [
    ...customFonts.map(f => `${f.name}=${f.name},sans-serif`),
    'Arial=arial,helvetica,sans-serif',
    'Tahoma=tahoma,arial,helvetica,sans-serif',
    'Georgia=georgia,serif',
    'Times New Roman=times new roman,times,serif',
    'Courier New=courier new,courier,monospace',
  ].join(';')


  return (
    <div className="rich-text-editor-wrapper" ref={wrapperRef} style={{ position: 'relative' }}>
      {/* ── Global style for custom fonts in admin preview ── */}
      {customFontCss && <style dangerouslySetInnerHTML={{ __html: customFontCss }} />}

      {/* ── Shield overlay to capture mouse events during drag ── */}
      <div 
        ref={shieldRef} 
        style={{ 
          display: 'none', position: 'fixed', 
          top: 0, left: 0, width: '100vw', height: '100vh', 
          zIndex: 9999, cursor: 'inherit' 
        }} 
      />

      <div ref={draggable.ghostRef} style={{ display: 'none' }} />
      <div ref={draggable.insertionRef} style={{ display: 'none' }} />

      <button
        ref={behindSelectBtnRef}
        type="button"
        style={{
          display: 'none',
          padding: '4px 8px',
          borderRadius: 6,
          background: '#111827',
          color: 'white',
          fontSize: 12,
          fontWeight: 700,
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.18)',
          cursor: 'pointer',
        }}
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onClick={() => {
          const editor = editorRef.current
          const target = behindSelectTargetRef.current
          if (!editor || !target) return
          editor.focus?.()
          editor.selection?.select?.(target)
          elementSelection.selectElement(target)
          updateBehindSelectButton()
        }}
      >
        {tx('selectBehind', 'تحديد العنصر الخلفي')}
      </button>

      {/* ── Element selection/resize overlay (always in DOM, shown/hidden imperatively) ── */}
      <div
        ref={overlayRef}
        onMouseEnter={() => { isOverOverlayRef.current = true }}
        onMouseLeave={() => { isOverOverlayRef.current = false }}
        style={{ position: 'absolute', zIndex: 999, pointerEvents: 'none', display: 'none' }}
      >
        <div
          data-drag-handle
          role="button"
          tabIndex={-1}
          aria-label={tx('dragElement', 'Drag element')}
          style={{
            position: 'absolute',
            top: -20,
            left: -20,
            width: 16,
            height: 16,
            background: '#3b82f6',
            borderRadius: 4,
            cursor: 'grab',
            pointerEvents: 'all',
            zIndex: 1002,
          }}
          onMouseEnter={() => { isOverOverlayRef.current = true }}
          onMouseLeave={() => { isOverOverlayRef.current = false }}
          onPointerDown={(e) => draggable.startDrag(e.nativeEvent, { immediate: true })}
        />
        {([
          [-1, -1, 'nwse-resize', 'Resize top-left'],
          [0, -1, 'ns-resize', 'Resize top'],
          [1, -1, 'nesw-resize', 'Resize top-right'],
          [-1, 0, 'ew-resize', 'Resize left'],
          [1, 0, 'ew-resize', 'Resize right'],
          [-1, 1, 'nesw-resize', 'Resize bottom-left'],
          [0, 1, 'ns-resize', 'Resize bottom'],
          [1, 1, 'nwse-resize', 'Resize bottom-right'],
        ] as [number, number, string, string][]).map(([dx, dy, cur, label], i) => (
          <div
            key={i}
            data-handle={i}
            role="button"
            tabIndex={-1}
            aria-label={label}
            className="resize-handle"
            style={{
              position: 'absolute', width: 10, height: 10,
              background: '#3b82f6', borderRadius: 2,
              cursor: cur, pointerEvents: 'all',
              zIndex: 1000,
            }}
            onMouseEnter={() => { isOverOverlayRef.current = true }}
            onMouseLeave={() => { isOverOverlayRef.current = false }}
            onPointerDown={(e) => resizable.startResize(dx, dy, e.nativeEvent)}
          />
        ))}
      </div>

      {label && <label className="editor-label">{label}</label>}

      {/* ── Custom font uploader ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.6rem 0.75rem',
        background: '#f8fafc', border: '1px solid #e2e8f0',
        borderRadius: '8px', marginBottom: '0.5rem', flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>
          🔤 {t('uploadFont') ?? 'رفع خط مخصص'}
        </span>
        <input
          type="text"
          id={fontNameInputId}
          name="custom-font-name"
          placeholder={t('fontName') ?? 'اسم الخط (مثال: Cairo)'}
          aria-label={t('fontName') ?? 'اسم الخط'}
          style={{
            padding: '0.35rem 0.6rem', borderRadius: '6px',
            border: '1px solid #cbd5e1', fontSize: '0.82rem',
            flex: 1, minWidth: '120px',
          }}
          disabled={isUploadingFont}
        />
        <label htmlFor={fontNameInputId} style={{
          padding: '0.35rem 0.9rem', borderRadius: '6px',
          background: isUploadingFont ? '#94a3b8' : '#e9496c',
          color: 'white', fontWeight: 700,
          fontSize: '0.82rem', cursor: isUploadingFont ? 'default' : 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.2s',
        }}>
          {isUploadingFont ? (t('uploading') ?? 'جاري الرفع...') : (t('chooseFont') ?? 'اختر ملف الخط')}
          <input
            type="file"
            id={`${fontNameInputId}-file`}
            name="custom-font-file"
            accept=".ttf,.otf,.woff,.woff2"
            style={{ display: 'none' }}
            disabled={isUploadingFont}
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const nameInput = document.getElementById(fontNameInputId) as HTMLInputElement
              const fontName = nameInput?.value?.trim() || file.name.replace(/\.[^.]+$/, '')

              setIsUploadingFont(true)
              setEditorLoadError(null)

              try {
                // Upload the font file and get the URL
                // We use 'uploads/fonts' to ensure it's picked up by our dynamic server /api/uploads/[...filename]
                const url = await uploadAsset(file, file.name, 'uploads/fonts')

                // Determine MIME type from file extension
                const ext = file.name.split('.').pop()?.toLowerCase()
                const mimeTypeMap: Record<string, string> = {
                  'ttf': 'font/ttf',
                  'otf': 'font/otf',
                  'woff': 'font/woff',
                  'woff2': 'font/woff2',
                }
                const mimeType = mimeTypeMap[ext || ''] || file.type || 'font/ttf'

                // Save font metadata to database
                const postData = {
                  name: fontName,
                  url,
                  fileName: file.name,
                  fileSize: file.size,
                  mimeType,
                  displayName: fontName
                }
                const res = await fetch('/api/fonts', {
                  method: 'POST',
                  body: JSON.stringify(postData),
                  headers: { 'Content-Type': 'application/json' }
                })

                if (res.ok) {
                  const data = await res.json()
                  setCustomFonts(data)
                  if (nameInput) nameInput.value = ''
                  setEditorLoadError(null)
                } else {
                  const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
                  console.error('API Error details:', errorData)
                  throw new Error(errorData.details || errorData.error || 'Failed to save font metadata')
                }
              } catch (err) {
                console.error('Font upload error:', err)
                setEditorLoadError(t('fontUploadFailed'))
              } finally {
                setIsUploadingFont(false)
              }
            }}
          />
        </label>
      </div>

      {/* ── Custom fonts list with delete button ── */}
      {customFonts.length > 0 && (
        <div style={{
          display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
          marginBottom: '0.75rem', padding: '0 0.25rem'
        }}>
          {customFonts.map(f => (
            <div key={f.name} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.25rem 0.6rem', background: '#f1f5f9',
              borderRadius: '6px', border: '1px solid #e2e8f0',
              fontSize: '0.75rem', fontWeight: 600, color: '#475569'
            }}>
              <span style={{ fontFamily: f.name }}>{f.name}</span>
              <button
                type="button"
                onClick={async () => {
                  if (confirm(t('confirmDeleteFont', { name: f.name }))) {
                    const res = await fetch(`/api/fonts?name=${encodeURIComponent(f.name)}`, { method: 'DELETE' });
                    if (res.ok) {
                      const data = await res.json();
                      setCustomFonts(data);
                      // Force re-render of TinyMCE by changing key if needed, 
                      // but fontFamilyFormats dependency in 'key' already handles this
                    }
                  }
                }}
                style={{
                  border: 'none', background: 'none', cursor: 'pointer',
                  color: '#ef4444', fontSize: '1rem', padding: '0 2px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                title={t('deleteFont')}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <TinyMCEEditor
        key={fontFamilyFormats}
        tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@7.7.1/tinymce.min.js"
        licenseKey="gpl"
        value={editorDisplayValue}
        onInit={(_evt, editor) => {
          setEditorLoadError(null)
          editorRef.current = editor
          tableInteractions.attach(editor)

          let behindBtnRaf: number | null = null
          const scheduleBehindBtnUpdate = () => {
            if (behindBtnRaf != null) return
            behindBtnRaf = window.requestAnimationFrame(() => {
              behindBtnRaf = null
              updateBehindSelectButton()
            })
          }

          /* Prevent native drag-and-drop while our custom resize is active */
          editor.on('dragstart', (e) => {
            const target = e.target as HTMLElement | null
            const hasMediaOrTable =
              !!target?.closest?.('img,video,iframe,table') ||
              !!target?.querySelector?.('img,video,iframe,table')
            if (hasMediaOrTable) e.preventDefault()
            if (isInteractingRef.current) e.preventDefault()
          })

          /* Wire up click → show overlay when a media/table element is selected */
          editor.on('click', (e) => {
            const target = e.target as HTMLElement
            elementSelection.handleEditorClick(target)
            scheduleBehindBtnUpdate()
          })

          const editorDoc = editor.getDoc?.() as Document | null
          const onDocPointerDown = (ev: PointerEvent) => {
            if (isInteractingRef.current) return
            const target = ev.target as HTMLElement | null
            const media =
              (target?.closest?.('img,video,iframe') as HTMLElement | null) ??
              ((target?.querySelector?.(':scope > img, :scope > video, :scope > iframe') as HTMLElement | null) ?? null)
            if (!media) return
            ev.preventDefault()
            ev.stopPropagation()
            elementSelection.selectElement(media)
            editor.selection?.select?.(media)
            draggable.startDrag(ev, { armOnly: true })
          }
          editorDoc?.addEventListener('pointerdown', onDocPointerDown, { capture: true })
          editor.on('remove', () => {
            editorDoc?.removeEventListener('pointerdown', onDocPointerDown as any, { capture: true } as any)
          })

          editor.on('DblClick', (e) => {
            const target = e.target as HTMLElement | null
            if (!target) return
            const media =
              (target.closest('img,video,iframe') as HTMLElement | null) ??
              ((target.querySelector?.(':scope > img, :scope > video, :scope > iframe') as HTMLElement | null) ?? null)
            if (!media) return
            editor.selection?.select?.(media)
            if (media.tagName === 'IMG') editor.execCommand('mceImage')
            else editor.execCommand('mceMedia')
          })

          /* Update overlay on every selection change */
          editor.on('SelectionChange', () => {
            requestAnimationFrame(() => {
              elementSelection.syncFromEditorSelection(editor)
              scheduleBehindBtnUpdate()
            })
          })

          editor.on('keydown', (e: any) => {
            const key = e.key as string
            const node = editor.selection?.getNode?.() as HTMLElement | null
            const inTableCell = !!node?.closest?.('td,th')

            if (key === 'Escape') {
              elementSelection.deselect()
              return
            }

            const isDelete = key === 'Backspace' || key === 'Delete'
            const isArrow = key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown'

            if ((isDelete || isArrow) && !inTableCell) {
              const selected = elementSelection.syncFromEditorSelection(editor)
              const el = selected?.el ?? null
              const kind = selected?.kind ?? null
              const directTag = node?.tagName ?? ''

              const isDirectMedia = directTag === 'IMG' || directTag === 'VIDEO' || directTag === 'IFRAME'
              const isDirectTable = directTag === 'TABLE'

              if (isDelete && el && kind && (isDirectMedia || isDirectTable)) {
                e.preventDefault()
                editor.undoManager.transact(() => {
                  el.remove()
                })
                editor.nodeChanged()
                editor.fire('Change')
                elementSelection.deselect()
                return
              }

              if (isArrow && el && kind && isDirectMedia && !e.ctrlKey && !e.metaKey && !e.altKey) {
                e.preventDefault()
                const step = e.shiftKey ? 10 : 1
                const style = window.getComputedStyle(el)
                const ml = parseInt(style.marginLeft || '0', 10) || 0
                const mt = parseInt(style.marginTop || '0', 10) || 0
                let nextML = ml
                let nextMT = mt
                if (key === 'ArrowLeft') nextML = ml - step
                if (key === 'ArrowRight') nextML = ml + step
                if (key === 'ArrowUp') nextMT = mt - step
                if (key === 'ArrowDown') nextMT = mt + step

                editor.undoManager.transact(() => {
                  editor.dom.setStyle(el, 'margin-left', `${nextML}px`)
                  editor.dom.setStyle(el, 'margin-top', `${nextMT}px`)
                })
                editor.nodeChanged()
                editor.fire('Change')
                resizable.positionOverlay(el)
                return
              }
            }

            const typingKeys = typeof key === 'string' && key.length === 1
            if (typingKeys) elementSelection.deselect()
          })

          /* Recalculate on iframe scroll (no setState needed) */
          let scrollRaf: number | null = null
          editor.getDoc()?.addEventListener('scroll', () => {
            if (scrollRaf != null) return
            scrollRaf = window.requestAnimationFrame(() => {
              scrollRaf = null
              if (elementSelection.activeElRef.current) resizable.positionOverlay(elementSelection.activeElRef.current)
              scheduleBehindBtnUpdate()
            })
          }, { passive: true })

          scheduleBehindBtnUpdate()
        }}
        init={{
          height: 560,
          min_height: 420,
          max_height: 1100,
          menubar: 'file edit view insert format tools table help',
          branding: false,
          promotion: false,
          premium_upgrade_promos: false,
          // skin: 'oxide', // Removed due to loading issues and deprecation warnings
          // content_css: false, // Use TinyMCE's default content CSS for better compatibility
          directionality: dir === 'rtl' ? 'rtl' : 'ltr',
          toolbar_mode: 'wrap',
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'codesample', 'fullscreen',
            'insertdatetime', 'directionality', 'nonbreaking', 'pagebreak',
            'quickbars', 'save', 'visualchars', 'emoticons',
            'media', 'table', 'wordcount',
          ],
          automatic_uploads: true,
          images_file_types: 'jpg,jpeg,png,gif,webp,svg',
          file_picker_types: 'image media',
          toolbar: [
            'undo redo | fontfamily fontsize blocks | bold italic underline strikethrough forecolor backcolor',
            'alignleft aligncenter alignright alignjustify | ltr rtl | bullist numlist outdent indent',
            'uploadImage uploadVideo | kintWrapInline kintWrapSquare kintWrapTight kintWrapBehind kintToggleAspect kintSelectBehindObject kintTableDefaultWidth | wrapImageLeft wrapImageRight clearWrap',
            'link image media emoticons charmap pagebreak nonbreaking',
            'table tabledelete | tableprops tablerowprops tablecellprops | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol | tablecellbackgroundcolor tablebordercolor | tablemergecells tablesplitcells',
            'codeTools codesample code visualblocks visualchars fullscreen preview | removeformat',
          ].join(' | '),
          quickbars_selection_toolbar: 'bold italic underline | forecolor backcolor | blocks | link | codesample',
          quickbars_insert_toolbar: 'quickimage quicktable pagebreak',
          contextmenu: 'kintmedia kinttable kintlink kinttext',
          quickbars_image_toolbar: '',

          /* ── Paste options: preserve all inline styles & colors ── */
          paste_data_images: true,
          paste_as_text: false,
          paste_merge_formats: true,
          smart_paste: true,
          paste_webkit_styles: 'all',
          paste_remove_styles_if_webkit: false,

          /* ── Pre-process pasted content to ensure styles are preserved ── */
          paste_preprocess: (_plugin, args) => {
            // Remove specific problematic inline styles early
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = args.content;

            const elements = tempDiv.querySelectorAll('*[style]');
            elements.forEach(el => {
              const style = el.getAttribute('style');
              if (style) {
                const filteredStyle = style.split(';').filter(s => {
                  const prop = s.split(':')[0].trim().toLowerCase();
                  const forbidden = [
                    'position', 'z-index', 'float', 'clear', 'transform',
                    'top', 'bottom', 'left', 'right',
                    // Consider adding width/height/display if still problematic
                    // 'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
                    // 'display'
                  ];
                  return !forbidden.some(f => prop.includes(f));
                }).join(';');
                if (filteredStyle) {
                  el.setAttribute('style', filteredStyle);
                } else {
                  el.removeAttribute('style');
                }
              }
            });
            args.content = tempDiv.innerHTML;
          },

          /* ── Post-process pasted content to fix any style issues ── */
          paste_postprocess: (editor, args) => {
            // Normalize pasted content to be compatible with font changes
            const dom = editor.dom
            const html = args.node

            // Find all spans with hardcoded font-family and remove them 
            // so they don't block the editor's font application
            const spans = dom.select('span[style*="font-family"]', html)
            spans.forEach((span: HTMLElement) => {
              // Only remove font-family, keep colors, sizes, etc.
              span.style.fontFamily = ''
              if (!span.getAttribute('style')) span.removeAttribute('style')
            })
          },

          style_formats: [
            { title: 'Paragraph', block: 'p' },
            { title: 'Heading 1', block: 'h1' },
            { title: 'Heading 2', block: 'h2' },
            { title: 'Heading 3', block: 'h3' },
            { title: 'Heading 4', block: 'h4' },
            { title: 'Blockquote', block: 'blockquote' },
            { title: 'Code Block', block: 'pre', classes: 'language-markup' },
          ],

          font_family_formats: fontFamilyFormats,
          fontsize_formats: '10pt 11pt 12pt 14pt 16pt 18pt 20pt 24pt 28pt 32pt 36pt',
          line_height_formats: '1 1.15 1.5 1.75 2 2.5 3',
          autosave_ask_before_unload: false,
          autosave_restore_when_empty: true,
          browser_spellcheck: true,
          object_resizing: false,

          /* ── Table settings: enable merge/split + color UI ── */
          table_use_colgroups: true,
          table_resize_bars: true,
          table_default_attributes: { border: '1' },
          table_default_styles: {
            width: '100%',
            borderCollapse: 'collapse',
            borderColor: '#64748b',
            borderWidth: '1px',
            borderStyle: 'solid',
          },
          table_cell_advtab: true,
          table_row_advtab: true,
          table_appearance_options: true,

          codesample_languages: [
            { text: 'HTML/XML', value: 'markup' },
            { text: 'CSS', value: 'css' },
            { text: 'JavaScript', value: 'javascript' },
            { text: 'TypeScript', value: 'typescript' },
            { text: 'JSX', value: 'jsx' },
            { text: 'TSX', value: 'tsx' },
            { text: 'JSON', value: 'json' },
            { text: 'Bash', value: 'bash' },
            { text: 'SQL', value: 'sql' },
            { text: 'Python', value: 'python' },
            { text: 'YAML', value: 'yaml' },
            { text: 'Markdown', value: 'markdown' },
          ],

          // This ensures that when we apply a font, it's applied correctly to the selected content
          // even if it has complex nested structures from copy-paste
          font_size_style_values: '10pt,11pt,12pt,14pt,16pt,18pt,20pt,24pt,28pt,32pt,36pt',

          setup: (editor) => {
            const getClosest = (element: Element | null, selector: string) =>
              element?.closest(selector) as HTMLElement | null

            /* ── Add custom fonts to editor body dynamically ── */
            editor.on('init', () => {
              if (customFontCss) {
                editor.dom.addStyle(customFontCss)
              }
            })

            /* ── Intercept font family application to override child styles PROFESSIONALLY ── */
            editor.on('ExecCommand', (e) => {
              if (e.command === 'FontName') {
                const fontValue = e.value;
                if (!fontValue) return;

                // Get the base font name (e.g. "Cairo" from "Cairo,sans-serif")
                const fontBase = fontValue.split(',')[0].replace(/['"]/g, '').toLowerCase();

                setTimeout(() => {
                  editor.undoManager.transact(() => {
                    const selectedNode = editor.selection.getNode();
                    const spans = editor.dom.select('span[style*="font-family"]', selectedNode);

                    spans.forEach(span => {
                      const spanFont = span.style.fontFamily.split(',')[0].replace(/['"]/g, '').toLowerCase();
                      // If the nested span has a different font, clear it so it inherits the new selection font
                      if (spanFont && spanFont !== fontBase) {
                        span.style.fontFamily = '';
                        if (!span.getAttribute('style')) span.removeAttribute('style');
                      }
                    });
                  });
                  editor.nodeChanged();
                }, 20);
              }
            });

            /* ── YouTube auto-embed on paste ── */
            editor.on('PastePreProcess', (e) => {
              const txt = e.content.trim()
              const embedUrl = toYouTubeEmbed(txt)
              if (embedUrl) {
                e.content = `<p><iframe src="${embedUrl}" width="560" height="315" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="max-width:100%;"></iframe></p>`
              }
            })

            /* ── Custom: Insert new table with NO trailing empty row ── */
            editor.ui.registry.addButton('kintInsertTable', {
              icon: 'table',
              tooltip: t('insertTable'),
              onAction: () => {
                const rows = parseInt(prompt(t('rows'), '3') || '3', 10) || 3
                const cols = parseInt(prompt(t('cols'), '3') || '3', 10) || 3
                let html = '<table border="1" style="width:100%;border-collapse:collapse;border:1px solid #64748b;"><colgroup>'
                for (let c = 0; c < cols; c++) html += `<col style="width:${Math.round(100 / cols)}%">`
                html += '</colgroup><thead><tr>'
                for (let c = 0; c < cols; c++) html += `<th style="padding:8px 10px;background:#f8fafc;font-weight:700;">${t('header')} ${c + 1}</th>`
                html += '</tr></thead><tbody>'
                for (let r = 0; r < rows - 1; r++) {
                  html += '<tr>'
                  for (let c = 0; c < cols; c++) html += `<td style="padding:8px 10px;"> </td>`
                  html += '</tr>'
                }
                html += '</tbody></table>'
                editor.insertContent(html)
              },
            })

            const getSelectedMediaEl = () => {
              const node = editor.selection.getNode() as HTMLElement | null
              if (!node) return null
              const tag = node.tagName
              if (tag === 'IMG' || tag === 'VIDEO' || tag === 'IFRAME') return node
              const direct = node.closest('img,video,iframe') as HTMLElement | null
              if (direct) return direct
              const behindContainer = node.closest('.kint-behind-container') as HTMLElement | null
              if (!behindContainer) return null
              return behindContainer.querySelector('img.kint-wrap-behind,video.kint-wrap-behind,iframe.kint-wrap-behind') as HTMLElement | null
            }

            const clearWrapClasses = (el: HTMLElement) => {
              const hadBehind = el.classList.contains('kint-wrap-behind')
              el.classList.remove(
                'kint-wrap-left',
                'kint-wrap-right',
                'kint-wrap-tight-left',
                'kint-wrap-tight-right',
                'kint-wrap-behind',
                'kint-wrap-inline'
              )
              el.removeAttribute('data-float')
              el.style.removeProperty('float')
              el.style.removeProperty('clear')
              el.style.removeProperty('margin')
              el.style.removeProperty('max-width')
              el.style.removeProperty('position')
              el.style.removeProperty('z-index')
              el.style.removeProperty('top')
              el.style.removeProperty('left')

              if (hadBehind) {
                const container = el.closest('p,div,li,td,th,figure') as HTMLElement | null
                if (container) {
                  const stillHasBehind = !!container.querySelector('img.kint-wrap-behind,video.kint-wrap-behind,iframe.kint-wrap-behind')
                  if (!stillHasBehind) {
                    container.classList.remove('kint-behind-container')
                    container.style.removeProperty('position')
                    container.style.removeProperty('z-index')
                    if (container.style.minHeight && /px\s*$/.test(container.style.minHeight)) {
                      container.style.removeProperty('min-height')
                    }
                  }
                }
              }
            }

            const setWrapInline = (el: HTMLElement) => {
              clearWrapClasses(el)
              el.classList.add('kint-wrap-inline')
            }

            const setWrapSquare = (el: HTMLElement) => {
              const preferRight =
                el.classList.contains('kint-wrap-right') ||
                el.classList.contains('kint-wrap-tight-right')
              clearWrapClasses(el)
              if (preferRight) el.classList.add('kint-wrap-right')
              else el.classList.add('kint-wrap-left')
              el.setAttribute('data-float', preferRight ? 'right' : 'left')
            }

            const setWrapTight = (el: HTMLElement) => {
              const preferRight =
                el.classList.contains('kint-wrap-right') ||
                el.classList.contains('kint-wrap-tight-right')
              clearWrapClasses(el)
              if (preferRight) el.classList.add('kint-wrap-tight-right')
              else el.classList.add('kint-wrap-tight-left')
              el.setAttribute('data-float', preferRight ? 'right' : 'left')
            }

            const setWrapBehind = (el: HTMLElement) => {
              clearWrapClasses(el)
              el.classList.add('kint-wrap-behind')
              const isTextyBlock = (block: HTMLElement) => {
                const tag = block.tagName.toUpperCase()
                if (tag !== 'P' && tag !== 'DIV' && tag !== 'LI' && tag !== 'TD' && tag !== 'TH' && tag !== 'FIGURE') return false
                return (block.textContent || '').trim().length > 0
              }

              const isMediaOnlyBlock = (block: HTMLElement) => {
                const nonBrEls = Array.from(block.querySelectorAll('*:not(br)')) as HTMLElement[]
                const mediaEls = Array.from(block.querySelectorAll('img,video,iframe')) as HTMLElement[]
                const hasText = (block.textContent || '').trim().length > 0
                return !hasText && mediaEls.length === 1 && nonBrEls.length === 1 && nonBrEls[0] === mediaEls[0]
              }

              const nearestBlock = el.closest('p,div,li,td,th,figure') as HTMLElement | null
              if (!nearestBlock) return

              const mediaRect = el.getBoundingClientRect()

              let wrapper: HTMLElement = nearestBlock
              if (isMediaOnlyBlock(nearestBlock)) {
                const next = nearestBlock.nextElementSibling as HTMLElement | null
                const prev = nearestBlock.previousElementSibling as HTMLElement | null
                const sibling = (next && isTextyBlock(next)) ? next : ((prev && isTextyBlock(prev)) ? prev : null)

                if (sibling && nearestBlock.parentElement) {
                  const div = editor.dom.create('div', { class: 'kint-behind-container' }) as HTMLElement
                  const insertBefore =
                    (nearestBlock.compareDocumentPosition(sibling) & Node.DOCUMENT_POSITION_FOLLOWING) ? nearestBlock : sibling
                  nearestBlock.parentElement.insertBefore(div, insertBefore)

                  div.appendChild(el)

                  if (nearestBlock.parentElement) {
                    nearestBlock.remove()
                  }
                  div.appendChild(sibling)
                  wrapper = div
                } else {
                  wrapper = nearestBlock
                  wrapper.classList.add('kint-behind-container')
                  wrapper.insertBefore(el, wrapper.firstChild)
                }
              } else {
                wrapper = nearestBlock
                wrapper.classList.add('kint-behind-container')
                wrapper.insertBefore(el, wrapper.firstChild)
              }

              wrapper.style.position = 'relative'
              wrapper.style.zIndex = '0'
              el.style.position = 'absolute'
              el.style.left = '0'
              el.style.top = '0'
              el.style.zIndex = '0'

              wrapper.style.removeProperty('min-height')
            }

            const setFloatWrap = (el: HTMLElement, mode: 'left' | 'right' | 'none') => {
              clearWrapClasses(el)
              if (mode === 'left') el.classList.add('kint-wrap-left')
              if (mode === 'right') el.classList.add('kint-wrap-right')
              if (mode !== 'none') el.setAttribute('data-float', mode)
            }

            editor.ui.registry.addButton('wrapImageLeft', {
              icon: 'align-left',
              tooltip: t('wrapLeft'),
              onAction: () => {
                const el = getSelectedMediaEl()
                if (!el) return
                editor.undoManager.transact(() => setFloatWrap(el, 'left'))
                editor.nodeChanged()
                editor.fire('Change')
              },
              onSetup: (api) => {
                const update = () => api.setEnabled(!!getSelectedMediaEl())
                const onSel = () => update()
                editor.on('SelectionChange', onSel)
                update()
                return () => editor.off('SelectionChange', onSel)
              },
            })
            editor.ui.registry.addButton('wrapImageRight', {
              icon: 'align-right',
              tooltip: t('wrapRight'),
              onAction: () => {
                const el = getSelectedMediaEl()
                if (!el) return
                editor.undoManager.transact(() => setFloatWrap(el, 'right'))
                editor.nodeChanged()
                editor.fire('Change')
              },
              onSetup: (api) => {
                const update = () => api.setEnabled(!!getSelectedMediaEl())
                const onSel = () => update()
                editor.on('SelectionChange', onSel)
                update()
                return () => editor.off('SelectionChange', onSel)
              },
            })
            editor.ui.registry.addButton('clearWrap', {
              icon: 'remove',
              tooltip: t('clearWrap'),
              onAction: () => {
                const el = getSelectedMediaEl()
                if (!el) return
                editor.undoManager.transact(() => setFloatWrap(el, 'none'))
                editor.nodeChanged()
                editor.fire('Change')
              },
              onSetup: (api) => {
                const update = () => api.setEnabled(!!getSelectedMediaEl())
                const onSel = () => update()
                editor.on('SelectionChange', onSel)
                update()
                return () => editor.off('SelectionChange', onSel)
              },
            })

            editor.ui.registry.addButton('kintWrapInline', {
              text: tx('wrapInline', 'Inline'),
              onAction: () => {
                const el = getSelectedMediaEl()
                if (!el) return
                editor.undoManager.transact(() => setWrapInline(el))
                editor.nodeChanged()
                editor.fire('Change')
              },
              onSetup: (api) => {
                const update = () => api.setEnabled(!!getSelectedMediaEl())
                const onSel = () => update()
                editor.on('SelectionChange', onSel)
                update()
                return () => editor.off('SelectionChange', onSel)
              },
            })

            editor.ui.registry.addButton('kintWrapSquare', {
              text: tx('wrapSquare', 'Square'),
              onAction: () => {
                const el = getSelectedMediaEl()
                if (!el) return
                editor.undoManager.transact(() => setWrapSquare(el))
                editor.nodeChanged()
                editor.fire('Change')
              },
              onSetup: (api) => {
                const update = () => api.setEnabled(!!getSelectedMediaEl())
                const onSel = () => update()
                editor.on('SelectionChange', onSel)
                update()
                return () => editor.off('SelectionChange', onSel)
              },
            })

            editor.ui.registry.addButton('kintWrapTight', {
              text: tx('wrapTight', 'Tight'),
              onAction: () => {
                const el = getSelectedMediaEl()
                if (!el) return
                editor.undoManager.transact(() => setWrapTight(el))
                editor.nodeChanged()
                editor.fire('Change')
              },
              onSetup: (api) => {
                const update = () => api.setEnabled(!!getSelectedMediaEl())
                const onSel = () => update()
                editor.on('SelectionChange', onSel)
                update()
                return () => editor.off('SelectionChange', onSel)
              },
            })

            editor.ui.registry.addButton('kintWrapBehind', {
              text: tx('wrapBehind', 'Behind'),
              onAction: () => {
                const el = getSelectedMediaEl()
                if (!el) return
                editor.undoManager.transact(() => setWrapBehind(el))
                editor.nodeChanged()
                editor.fire('Change')
              },
              onSetup: (api) => {
                const update = () => api.setEnabled(!!getSelectedMediaEl())
                const onSel = () => update()
                editor.on('SelectionChange', onSel)
                update()
                return () => editor.off('SelectionChange', onSel)
              },
            })

            editor.ui.registry.addButton('kintEditSelectedMedia', {
              text: tx('properties', 'Properties'),
              onAction: () => {
                const el = getSelectedMediaEl()
                if (!el) return
                editor.selection?.select?.(el)
                if (el.tagName === 'IMG') editor.execCommand('mceImage')
                else editor.execCommand('mceMedia')
              },
            })

            editor.ui.registry.addButton('kintSelectBehindObject', {
              text: tx('selectBehind', 'Select behind'),
              onAction: () => {
                const node = editor.selection.getNode() as HTMLElement | null
                const container = node?.closest?.('.kint-behind-container') as HTMLElement | null
                const el = container?.querySelector?.('img.kint-wrap-behind,video.kint-wrap-behind,iframe.kint-wrap-behind') as HTMLElement | null
                if (!el) return
                editor.selection?.select?.(el)
                editor.nodeChanged()
              },
              onSetup: (api) => {
                const update = () => {
                  const node = editor.selection.getNode() as HTMLElement | null
                  const container = node?.closest?.('.kint-behind-container') as HTMLElement | null
                  api.setEnabled(!!container?.querySelector?.('img.kint-wrap-behind,video.kint-wrap-behind,iframe.kint-wrap-behind'))
                }
                const onSel = () => update()
                editor.on('SelectionChange', onSel)
                update()
                return () => editor.off('SelectionChange', onSel)
              },
            })

            editor.ui.registry.addButton('kintToggleAspect', {
              text: tx('aspectLock', 'Lock ratio'),
              onAction: () => {
                const el = getSelectedMediaEl()
                if (!el) return
                const tag = el.tagName
                if (tag !== 'VIDEO' && tag !== 'IFRAME') return
                editor.undoManager.transact(() => {
                  el.classList.toggle('kint-aspect-unlocked')
                })
                editor.nodeChanged()
                editor.fire('Change')
              },
              onSetup: (api) => {
                const update = () => {
                  const el = getSelectedMediaEl()
                  const tag = el?.tagName
                  api.setEnabled(tag === 'VIDEO' || tag === 'IFRAME')
                }
                const onSel = () => update()
                editor.on('SelectionChange', onSel)
                update()
                return () => editor.off('SelectionChange', onSel)
              },
            })

            const getSelectedTableEl = () => {
              const node = editor.selection.getNode() as HTMLElement | null
              if (!node) return null
              if (node.tagName === 'TABLE') return node as HTMLTableElement
              return (node.closest?.('table') as HTMLTableElement | null)
            }

            editor.ui.registry.addButton('kintTableDefaultWidth', {
              text: tx('tableDefaultWidth', 'Table default'),
              onAction: () => {
                const table = getSelectedTableEl()
                if (!table) return
                editor.undoManager.transact(() => {
                  table.style.removeProperty('width')
                  table.style.removeProperty('height')
                  table.style.removeProperty('table-layout')
                  table.removeAttribute('width')
                  table.removeAttribute('height')
                  const cols = Array.from(table.querySelectorAll('col')) as HTMLElement[]
                  cols.forEach(col => {
                    col.style.removeProperty('width')
                    col.removeAttribute('width')
                    if (!col.getAttribute('style')) col.removeAttribute('style')
                  })
                  const rows = Array.from(table.querySelectorAll('tr')) as HTMLElement[]
                  rows.forEach(tr => {
                    tr.style.removeProperty('height')
                    tr.removeAttribute('height')
                    if (!tr.getAttribute('style')) tr.removeAttribute('style')
                  })
                })
                editor.nodeChanged()
                editor.fire('Change')
              },
              onSetup: (api) => {
                const update = () => api.setEnabled(!!getSelectedTableEl())
                const onSel = () => update()
                editor.on('SelectionChange', onSel)
                update()
                return () => editor.off('SelectionChange', onSel)
              },
            })

            const replaceSelectedMediaSource = async () => {
              const node = editor.selection.getNode() as HTMLElement | null
              if (!node) return
              const tag = node.tagName
              if (tag !== 'IMG' && tag !== 'VIDEO' && tag !== 'IFRAME') return
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = tag === 'IMG' ? 'image/*' : 'video/*'
              input.onchange = async () => {
                const file = input.files?.[0]
                if (!file) return
                try {
                  const url = await uploadAsset(file, file.name)
                  editor.undoManager.transact(() => {
                    node.setAttribute('src', url)
                    if (tag === 'IMG') node.setAttribute('alt', file.name)
                  })
                  editor.nodeChanged()
                  editor.fire('Change')
                } catch {
                  setEditorLoadError(t('replaceError'))
                }
              }
              input.click()
            }

            editor.ui.registry.addButton('replaceSelectedMedia', {
              text: t('replaceFile'),
              onAction: () => { void replaceSelectedMediaSource() },
            })
            editor.ui.registry.addButton('deleteSelectedNode', {
              icon: 'remove',
              tooltip: t('deleteElement'),
              onAction: () => {
                const node = editor.selection.getNode() as HTMLElement | null
                if (!node) return
                const target = (node.tagName === 'IMG' || node.tagName === 'VIDEO' || node.tagName === 'IFRAME' || node.tagName === 'TABLE')
                  ? node
                  : (node.closest('img,video,iframe,table') as HTMLElement | null)
                if (!target) return
                editor.undoManager.transact(() => target.remove())
                editor.nodeChanged()
                editor.fire('Change')
              },
            })

            editor.ui.registry.addMenuItem('kintEditMedia', { text: t('editMedia'), onAction: () => { const node = editor.selection.getNode() as HTMLElement | null; if (!node) return; if (node.tagName === 'IMG') editor.execCommand('mceImage'); else editor.execCommand('mceMedia') } })
            editor.ui.registry.addMenuItem('kintReplaceMedia', { text: t('replaceFile'), onAction: () => { void replaceSelectedMediaSource() } })
            editor.ui.registry.addMenuItem('kintRemoveNode', { text: t('deleteElement'), onAction: () => { const node = editor.selection.getNode(); if (node) node.remove(); editor.nodeChanged() } })
            editor.ui.registry.addMenuItem('kintWrapInlineMenu', {
              text: tx('wrapInline', 'Inline'),
              onAction: () => {
                const el = getSelectedMediaEl()
                if (!el) return
                editor.undoManager.transact(() => setWrapInline(el))
                editor.nodeChanged()
                editor.fire('Change')
              },
            })
            editor.ui.registry.addMenuItem('kintWrapSquareMenu', {
              text: tx('wrapSquare', 'Square'),
              onAction: () => {
                const el = getSelectedMediaEl()
                if (!el) return
                editor.undoManager.transact(() => setWrapSquare(el))
                editor.nodeChanged()
                editor.fire('Change')
              },
            })
            editor.ui.registry.addMenuItem('kintWrapTightMenu', {
              text: tx('wrapTight', 'Tight'),
              onAction: () => {
                const el = getSelectedMediaEl()
                if (!el) return
                editor.undoManager.transact(() => setWrapTight(el))
                editor.nodeChanged()
                editor.fire('Change')
              },
            })
            editor.ui.registry.addMenuItem('kintWrapBehindMenu', {
              text: tx('wrapBehind', 'Behind'),
              onAction: () => {
                const el = getSelectedMediaEl()
                if (!el) return
                editor.undoManager.transact(() => setWrapBehind(el))
                editor.nodeChanged()
                editor.fire('Change')
              },
            })
            editor.ui.registry.addMenuItem('kintToggleAspectMenu', {
              text: tx('aspectLock', 'Lock ratio'),
              onAction: () => {
                const el = getSelectedMediaEl()
                if (!el) return
                const tag = el.tagName
                if (tag !== 'VIDEO' && tag !== 'IFRAME') return
                editor.undoManager.transact(() => {
                  el.classList.toggle('kint-aspect-unlocked')
                })
                editor.nodeChanged()
                editor.fire('Change')
              },
            })
            editor.ui.registry.addMenuItem('kintSelectBehindObjectMenu', {
              text: tx('selectBehind', 'Select behind'),
              onAction: () => {
                const node = editor.selection.getNode() as HTMLElement | null
                const container = node?.closest?.('.kint-behind-container') as HTMLElement | null
                const el = container?.querySelector?.('img.kint-wrap-behind,video.kint-wrap-behind,iframe.kint-wrap-behind') as HTMLElement | null
                if (!el) return
                editor.selection?.select?.(el)
                editor.nodeChanged()
              },
            })

            editor.ui.registry.addMenuItem('kintTableProps', { text: t('tableProps'), onAction: () => editor.execCommand('mceTableProps') })
            editor.ui.registry.addMenuItem('kintTableCellProps', { text: tx('cellProps', 'Cell properties'), onAction: () => editor.execCommand('mceTableCellProps') })
            editor.ui.registry.addMenuItem('kintTableRowProps', { text: tx('rowProps', 'Row properties'), onAction: () => editor.execCommand('mceTableRowProps') })
            editor.ui.registry.addMenuItem('kintTableInsertRowBefore', { text: t('insertRowBefore'), onAction: () => editor.execCommand('mceTableInsertRowBefore') })
            editor.ui.registry.addMenuItem('kintTableInsertRowAfter', { text: t('insertRowAfter'), onAction: () => editor.execCommand('mceTableInsertRowAfter') })
            editor.ui.registry.addMenuItem('kintTableDeleteRow', { text: t('deleteRow'), onAction: () => editor.execCommand('mceTableDeleteRow') })
            editor.ui.registry.addMenuItem('kintTableInsertColBefore', { text: t('insertColBefore'), onAction: () => editor.execCommand('mceTableInsertColBefore') })
            editor.ui.registry.addMenuItem('kintTableInsertColAfter', { text: t('insertColAfter'), onAction: () => editor.execCommand('mceTableInsertColAfter') })
            editor.ui.registry.addMenuItem('kintTableDeleteCol', { text: t('deleteCol'), onAction: () => editor.execCommand('mceTableDeleteCol') })
            editor.ui.registry.addMenuItem('kintDeleteTable', { text: t('deleteTable'), onAction: () => editor.execCommand('mceTableDelete') })
            editor.ui.registry.addMenuItem('kintMergeCells', { text: t('mergeCells'), onAction: () => editor.execCommand('mceTableMergeCells') })
            editor.ui.registry.addMenuItem('kintSplitCells', { text: t('splitCells'), onAction: () => editor.execCommand('mceTableSplitCells') })

            editor.ui.registry.addMenuItem('kintEditLink', { text: t('editLink'), onAction: () => editor.execCommand('mceLink') })
            editor.ui.registry.addMenuItem('kintRemoveLink', { text: t('removeLink'), onAction: () => editor.execCommand('unlink') })
            editor.ui.registry.addMenuItem('kintOpenLink', { text: t('openLink'), onAction: () => { const node = editor.selection.getNode(); const link = getClosest(node, 'a'); if (link) window.open(link.getAttribute('href') || '', '_blank') } })

            editor.ui.registry.addMenuItem('kintBold', { text: t('bold'), onAction: () => editor.execCommand('Bold') })
            editor.ui.registry.addMenuItem('kintItalic', { text: t('italic'), onAction: () => editor.execCommand('Italic') })
            editor.ui.registry.addMenuItem('kintUnderline', { text: t('underline'), onAction: () => editor.execCommand('Underline') })
            editor.ui.registry.addMenuItem('kintStrike', { text: t('strikeThrough'), onAction: () => editor.execCommand('Strikethrough') })
            editor.ui.registry.addMenuItem('kintAlignLeft', { text: t('alignLeft'), onAction: () => editor.execCommand('JustifyLeft') })
            editor.ui.registry.addMenuItem('kintAlignCenter', { text: t('alignCenter'), onAction: () => editor.execCommand('JustifyCenter') })
            editor.ui.registry.addMenuItem('kintAlignRight', { text: t('alignRight'), onAction: () => editor.execCommand('JustifyRight') })
            editor.ui.registry.addMenuItem('kintAlignJustify', { text: t('alignJustify'), onAction: () => editor.execCommand('JustifyFull') })
            editor.ui.registry.addMenuItem('kintBulletList', { text: t('bulletList'), onAction: () => editor.execCommand('InsertUnorderedList') })
            editor.ui.registry.addMenuItem('kintOrderedList', { text: t('orderedList'), onAction: () => editor.execCommand('InsertOrderedList') })
            editor.ui.registry.addMenuItem('kintBlockquote', { text: t('blockquote'), onAction: () => editor.execCommand('mceBlockQuote') })
            editor.ui.registry.addMenuItem('kintTextCode', { text: t('codeBlock'), onAction: () => editor.execCommand('mceCodeSample') })
            editor.ui.registry.addMenuItem('kintTextClear', { text: t('clear'), onAction: () => editor.execCommand('RemoveFormat') })

            editor.ui.registry.addContextMenu('kintmedia', {
              update: (element) => {
                const media = getClosest(element, 'img,video,iframe')
                if (!media) return ''
                const tag = (media as HTMLElement).tagName
                const isVideoish = tag === 'VIDEO' || tag === 'IFRAME'
                const inBehind = !!(media as HTMLElement).closest?.('.kint-behind-container')
                const base = 'kintEditMedia kintReplaceMedia'
                const wraps = 'kintWrapInlineMenu kintWrapSquareMenu kintWrapTightMenu kintWrapBehindMenu'
                const extras = [
                  inBehind ? 'kintSelectBehindObjectMenu' : '',
                  isVideoish ? 'kintToggleAspectMenu' : '',
                ].filter(Boolean).join(' ')
                const tail = 'kintRemoveNode'
                return `${base} | ${wraps}${extras ? ` | ${extras}` : ''} | ${tail}`
              },
            })
            editor.ui.registry.addContextMenu('kinttable', {
              update: (element) => {
                const table = getClosest(element, 'table')
                return table ? 'kintTableProps kintTableCellProps kintTableRowProps | kintTableInsertRowBefore kintTableInsertRowAfter kintTableDeleteRow | kintTableInsertColBefore kintTableInsertColAfter kintTableDeleteCol | kintMergeCells kintSplitCells | kintDeleteTable' : ''
              },
            })
            editor.ui.registry.addContextMenu('kintlink', {
              update: (element) => {
                const anchor = getClosest(element, 'a')
                return anchor ? 'kintEditLink kintCopyLink kintUnlink' : ''
              },
            })
            editor.ui.registry.addContextMenu('kinttext', {
              update: (element) => {
                const media = getClosest(element, 'img,video,iframe')
                const table = getClosest(element, 'table')
                const anchor = getClosest(element, 'a')
                if (media || table || anchor) return ''
                return 'undo redo | kintBold kintItalic kintUnderline | kintTextCode kintTextClear'
              },
            })
            editor.ui.registry.addContextToolbar('kintTableToolbar', {
              predicate: (node) => (node as HTMLElement).tagName === 'TABLE',
              items: 'tableprops | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol | tablemergecells tablesplitcells | tabledelete',
              position: 'node',
              scope: 'node',
            })

            editor.ui.registry.addButton('uploadImage', {
              icon: 'image',
              tooltip: t('uploadImage'),
              onAction: () => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*'
                input.onchange = async () => {
                  const file = input.files?.[0]
                  if (!file) return
                  try {
                    const url = await uploadAsset(file, file.name)
                    editor.insertContent(`<img src="${url}" alt="${file.name}" style="max-width:100%;" />`)
                  } catch {
                    setEditorLoadError(t('uploadImageError'))
                  }
                }
                input.click()
              },
            })

            editor.ui.registry.addButton('uploadVideo', {
              icon: 'embed',
              tooltip: t('uploadVideo'),
              onAction: () => {
                const choice = prompt(t('videoChoice'))
                if (choice !== null && choice.trim()) {
                  const embedUrl = toYouTubeEmbed(choice.trim())
                  if (embedUrl) {
                    editor.insertContent(`<p><iframe src="${embedUrl}" width="560" height="315" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="max-width:100%;display:block;margin:0 auto;"></iframe></p>`)
                  } else {
                    editor.insertContent(`<p><iframe src="${choice.trim()}" width="560" height="315" frameborder="0" allowfullscreen style="max-width:100%;"></iframe></p>`)
                  }
                } else {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'video/*'
                  input.onchange = async () => {
                    const file = input.files?.[0]
                    if (!file) return
                    try {
                      const url = await uploadAsset(file, file.name)
                      editor.insertContent(`<video controls src="${url}" style="max-width: 100%;display:block;"></video>`)
                    } catch {
                      setEditorLoadError(t('uploadVideoError'))
                    }
                  }
                  input.click()
                }
              },
            })

            editor.ui.registry.addMenuButton('codeTools', {
              text: 'Code',
              fetch: (callback) => {
                callback([
                  { type: 'menuitem', text: 'Code Block', onAction: () => editor.execCommand('mceCodeSample') },
                  { type: 'menuitem', text: 'Source Code', onAction: () => editor.execCommand('mceCodeEditor') },
                  { type: 'menuitem', text: 'Visual Blocks', onAction: () => editor.execCommand('mceVisualBlocks') },
                ])
              },
            })
          },

          images_upload_handler: async (blobInfo) => {
            return await uploadAsset(blobInfo.blob(), blobInfo.filename())
          },

          file_picker_callback: async (callback, _value, meta) => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = meta.filetype === 'image' ? 'image/*' : 'video/*'
            input.onchange = async () => {
              const file = input.files?.[0]
              if (!file) return
              try {
                const url = await uploadAsset(file, file.name)
                if (meta.filetype === 'image') callback(url, { alt: file.name })
                else callback(url)
              } catch {
                setEditorLoadError('فشل رفع الملف')
              }
            }
            input.click()
          },

          content_style: `
            ${customFontCss}
            /* Base styles for editor body */
            body {
              font-family: Inter, system-ui, sans-serif;
              font-size: 16px;
              line-height: 1.7;
              color: #334155;
              padding: 14px;
              direction: ${dir === 'rtl' ? 'rtl' : 'ltr'};
              overflow-y: auto !important; /* Ensure content is scrollable */
            }
            
            /* Ensure custom fonts are available throughout the editor */
            * {
              /* Allow fonts to apply properly */
            }

            /* Aggressive reset for nested divs to prevent layout issues */
            div {
              margin: 0 !important;
              padding: 0 !important;
              box-sizing: border-box !important;
              max-width: none !important;
              position: relative !important;
              z-index: auto !important;
              float: none !important;
              clear: both !important;
              display: block !important;
              top: auto !important;
              bottom: auto !important;
              left: auto !important;
              right: auto !important;
              transform: none !important;
              min-height: auto !important;
              height: auto !important;
              overflow: visible !important;
            }
            
            /* Table styling */
            table {
              border-collapse: collapse;
              border: 1px solid #64748b;
              max-width: 100%;
            }
            table:not([width]):not([style*="width"]) {
              width: 100%;
            }
            tbody, thead, tfoot, tr, th, td {
              border-color: inherit;
              border-style: inherit;
              border-width: inherit;
            }
            table[width], table[style*="width"] {
              table-layout: fixed;
            }
            table th, table td {
              padding: 10px 12px;
              vertical-align: top;
              word-break: break-word;
              overflow-wrap: anywhere;
            }
            table th p, table td p {
              margin: 0 !important;
            }
            table th {
              background: #f8fafc;
              font-weight: 700;
            }
            
            /* Code styling */
            pre[class*="language-"] {
              background: #0f172a;
              color: #e2e8f0;
              padding: 14px;
              border-radius: 10px;
              overflow-x: auto;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
            }
            code {
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
            }
            
            /* Media styling */
            img, video, iframe {
              max-width: none !important;
            }
            iframe {
              pointer-events: none;
            }
            video, iframe {
              display: block;
              max-width: 100%;
              margin: 0.5rem auto;
            }
            img[data-mce-selected], video[data-mce-selected], iframe[data-mce-selected] {
              outline: 2px solid #3b82f6;
              outline-offset: 2px;
            }
            
            /* Float support for text beside images */
            img[style*="float: left"], img[style*="float:left"] {
              margin: 0 1rem 0.5rem 0;
            }
            img[style*="float: right"], img[style*="float:right"] {
              margin: 0 0 0.5rem 1rem;
            }
            img.kint-wrap-left {
              float: left;
              margin: 0 1rem 0.5rem 0;
              max-width: 45%;
              height: auto;
            }
            img.kint-wrap-right {
              float: right;
              margin: 0 0 0.5rem 1rem;
              max-width: 45%;
              height: auto;
            }
            img.kint-wrap-tight-left, video.kint-wrap-tight-left, iframe.kint-wrap-tight-left {
              float: left;
              margin: 0 0.6rem 0.35rem 0;
              max-width: 45%;
              shape-outside: margin-box;
            }
            img.kint-wrap-tight-right, video.kint-wrap-tight-right, iframe.kint-wrap-tight-right {
              float: right;
              margin: 0 0 0.35rem 0.6rem;
              max-width: 45%;
              shape-outside: margin-box;
            }
            img.kint-wrap-left, video.kint-wrap-left, iframe.kint-wrap-left {
              float: left;
              margin: 0 1rem 0.5rem 0;
              max-width: 45%;
            }
            img.kint-wrap-right, video.kint-wrap-right, iframe.kint-wrap-right {
              float: right;
              margin: 0 0 0.5rem 1rem;
              max-width: 45%;
            }
            img.kint-wrap-inline, video.kint-wrap-inline, iframe.kint-wrap-inline {
              float: none;
              margin: 0;
              max-width: 100%;
            }
            video.kint-wrap-left:not([height]):not([style*="height"]),
            video.kint-wrap-right:not([height]):not([style*="height"]),
            video.kint-wrap-tight-left:not([height]):not([style*="height"]),
            video.kint-wrap-tight-right:not([height]):not([style*="height"]),
            iframe.kint-wrap-left:not([height]):not([style*="height"]),
            iframe.kint-wrap-right:not([height]):not([style*="height"]),
            iframe.kint-wrap-tight-left:not([height]):not([style*="height"]),
            iframe.kint-wrap-tight-right:not([height]):not([style*="height"]) {
              height: auto;
            }
            .kint-behind-container {
              position: relative;
              z-index: 0;
            }
            .kint-behind-container img.kint-wrap-behind,
            .kint-behind-container video.kint-wrap-behind,
            .kint-behind-container iframe.kint-wrap-behind {
              position: absolute;
              left: 0;
              top: 0;
              z-index: 0;
              pointer-events: none;
            }
            .kint-behind-container > :not(img.kint-wrap-behind):not(video.kint-wrap-behind):not(iframe.kint-wrap-behind) {
              position: relative;
              z-index: 1;
            }
            img.kint-wrap-behind, video.kint-wrap-behind, iframe.kint-wrap-behind {
              opacity: 0.35;
              mix-blend-mode: multiply;
            }
            video.kint-aspect-unlocked, iframe.kint-aspect-unlocked {
              outline-style: dashed;
            }
            
            /* Ensure pasted styled content preserves its appearance */
            span[style*="font-family"] {
              /* Keep pasted font styles intact */
            }
            
            /* Minimize the forced empty paragraph after tables */
            body > p:last-child {
              margin-bottom: 0;
            }
          `,
        }}
        onEditorChange={(html) => {
          const normalized = normalizeBehindHtml(normalizeTableHtml(html))
          let clean = DOMPurify.sanitize(normalized, {
            ADD_TAGS: ['video', 'source', 'iframe', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'colgroup', 'col', 'span', 'font', 'style'],
            ADD_ATTR: [
              'controls', 'width', 'height', 'src', 'allow', 'allowfullscreen', 'frameborder',
              'data-type', 'type', 'style', 'colspan', 'rowspan', 'data-float',
              'data-border-color', 'data-border-width', 'border', 'cellpadding', 'cellspacing',
              'class', 'id', 'dir', 'lang', 'color', 'bgcolor', 'align', 'valign', 'face', 'size',
              'data-mce-style', 'data-mce-selected', 'data-mce-href', 'data-mce-src', 'data-mce-bogus'
            ],
            PARSER_MEDIA_TYPE: 'text/html',
            FORCE_BODY: false,
            WHOLE_DOCUMENT: false,
          })
          clean = ensurePublicRteStyles(clean)

          if (!onChange) setLocalContent(clean)
          updateStats(clean)
          autosave(clean)
          onChange?.(clean)
        }}
      />
      {editorLoadError && (
        <div className="editor-info" style={{ color: '#b91c1c' }}>{editorLoadError}</div>
      )}
      <div className="editor-info">💡 {t('tip')}</div>
      <div className="editor-statusbar">
        <span>{`Words: ${stats.words}`}</span>
        <span>{`Chars: ${stats.chars}`}</span>
        <span>{`Lines: ${stats.lines}`}</span>
      </div>
    </div>
  )
}
