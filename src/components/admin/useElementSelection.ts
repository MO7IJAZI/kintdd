import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react'

export type SelectedKind = 'img' | 'video' | 'iframe' | 'table'

function getKindFromElement(el: HTMLElement): SelectedKind {
  const tag = el.tagName.toUpperCase()
  if (tag === 'IMG') return 'img'
  if (tag === 'VIDEO') return 'video'
  if (tag === 'IFRAME') return 'iframe'
  return 'table'
}

function getSelectableFromNode(node: HTMLElement | null): { el: HTMLElement; kind: SelectedKind } | null {
  if (!node) return null

  const directTag = node.tagName?.toUpperCase?.()
  if (directTag === 'IMG' || directTag === 'VIDEO' || directTag === 'IFRAME' || directTag === 'TABLE') {
    return { el: node, kind: getKindFromElement(node) }
  }

  try {
    const directChild = node.querySelector?.(':scope > img, :scope > video, :scope > iframe, :scope > table') as HTMLElement | null
    if (directChild) return { el: directChild, kind: getKindFromElement(directChild) }
  } catch {}

  const closest = node.closest?.('img,video,iframe,table') as HTMLElement | null
  if (!closest) return null
  return { el: closest, kind: getKindFromElement(closest) }
}

export function useElementSelection(args: {
  wrapperRef: RefObject<HTMLElement>
  positionOverlay: (el: HTMLElement | null) => void
}) {
  const activeElRef = useRef<HTMLElement | null>(null)

  const selectElement = useCallback((el: HTMLElement | null) => {
    activeElRef.current = el
    args.positionOverlay(el)
  }, [args])

  const deselect = useCallback(() => {
    selectElement(null)
  }, [selectElement])

  const handleEditorClick = useCallback((target: HTMLElement | null) => {
    const selected = getSelectableFromNode(target)
    selectElement(selected?.el ?? null)
    return selected
  }, [selectElement])

  const syncFromEditorSelection = useCallback((editor: any) => {
    const node = editor?.selection?.getNode?.() as HTMLElement | null
    const selected = getSelectableFromNode(node)
    selectElement(selected?.el ?? null)
    return selected
  }, [selectElement])

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const wrap = args.wrapperRef.current
      if (!wrap) return
      const target = e.target as Node | null
      if (target && wrap.contains(target)) return
      deselect()
    }

    document.addEventListener('pointerdown', onPointerDown, { capture: true })
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, { capture: true } as any)
    }
  }, [args.wrapperRef, deselect])

  return useMemo(() => {
    return { activeElRef, selectElement, deselect, handleEditorClick, syncFromEditorSelection }
  }, [deselect, handleEditorClick, selectElement, syncFromEditorSelection])
}
