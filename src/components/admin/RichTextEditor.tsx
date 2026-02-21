'use client'

import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'
import { Node } from '@tiptap/core'
import DOMPurify from 'dompurify'
import debounce from 'lodash.debounce'
import './RichTextEditor.css'
import { useTranslations } from 'next-intl'

interface Props {
  label?: string
  value?: string
  onChange?: (html: string) => void
  autosaveKey?: string
  dir?: 'ltr' | 'rtl' | 'auto'
}

interface SelectedImage {
  pos: number
  src: string
  x: number
  y: number
  width: number
  height: number
}

interface SelectedVideo {
  pos: number
  src: string
  width: number
  height: number
}
/**
 * Image Resizer Extension for Tiptap
 * Allows resizing and repositioning of images inline
 */
const ImageResizer = Image.extend({
  group: 'inline',
  inline: true,
  atom: true,
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute('width'),
        renderHTML: (attributes) => {
          return { width: attributes.width }
        },
      },
      height: {
        default: null,
        parseHTML: (element) => element.getAttribute('height'),
        renderHTML: (attributes) => {
          return { height: attributes.height }
        },
      },
      dataAlign: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-align'),
        renderHTML: (attributes) => {
          return { 'data-align': attributes.dataAlign }
        },
      },
      dataFloat: {
        default: 'none',
        parseHTML: (element) => element.getAttribute('data-float'),
        renderHTML: (attributes) => {
          return { 'data-float': attributes.dataFloat }
        },
      },
    }
  },
  renderHTML({ HTMLAttributes }) {
    return ['img', { ...HTMLAttributes, class: 'editor-image' }]
  },
})

const VideoNode = Node.create({
  name: 'video',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      type: { default: 'video' },
      width: { default: null },
      height: { default: null },
      controls: { default: true },
      dataFloat: {
        default: 'none',
        parseHTML: (element) => element.getAttribute('data-float'),
        renderHTML: (attributes) => {
          return { 'data-float': attributes.dataFloat }
        },
      },
    }
  },
  parseHTML() {
    return [
      { tag: 'video' },
      { tag: 'iframe[data-type="video"]' },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    if (HTMLAttributes.type === 'iframe') {
      return ['iframe', { ...HTMLAttributes, 'data-type': 'video', class: 'editor-video', frameborder: '0', allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture', allowfullscreen: 'true' }]
    }
    return ['video', { ...HTMLAttributes, class: 'editor-video' }]
  },
})

function normalizeVideoUrl(input: string): { type: 'iframe' | 'video', src: string } | null {
  let url = input.trim()
  if (!url) return null
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`
  }
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')
    if (host === 'youtube.com' || host === 'youtu.be') {
      let id = ''
      if (host === 'youtu.be') {
        id = u.pathname.split('/')[1] || ''
      } else {
        if (u.pathname.startsWith('/watch')) {
          id = u.searchParams.get('v') || ''
        } else if (u.pathname.startsWith('/shorts/')) {
          id = u.pathname.split('/')[2] || ''
        } else if (u.pathname.startsWith('/embed/')) {
          id = u.pathname.split('/')[2] || ''
        }
      }
      if (!id) return null
      return { type: 'iframe', src: `https://www.youtube.com/embed/${id}` }
    }
    if (host === 'vimeo.com') {
      const parts = u.pathname.split('/').filter(Boolean)
      const id = parts[0]
      if (!id || !/^\d+$/.test(id)) return null
      return { type: 'iframe', src: `https://player.vimeo.com/video/${id}` }
    }
    if (/\.(mp4|webm|ogg)$/i.test(u.pathname)) {
      return { type: 'video', src: u.toString() }
    }
    return null
  } catch {
    return null
  }
}

export default function RichTextEditor({
  label,
  value = '',
  onChange,
  autosaveKey,
  dir = 'ltr',
}: Props) {
  const t = useTranslations('AdminRichText')
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<SelectedVideo | null>(null)
  const [customWidth, setCustomWidth] = useState<string>('')
  /* ============================
     Auto-Save (Debounced)
   ============================ */
  const autosave = useMemo(
    () =>
      debounce((html: string) => {
        if (autosaveKey) {
          localStorage.setItem(autosaveKey, html)
        }
      }, 1000),
    [autosaveKey]
  )

  /* ============================
     Upload Image Handler
   ============================ */
  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      throw new Error(t('uploadError'))
    }

    const data = await res.json()
    return data.url as string
  }, [t])

  const uploadVideo = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    if (!res.ok) {
      throw new Error('Upload failed')
    }
    const data = await res.json()
    return data.url as string
  }, [])

  /* ============================
     Tiptap Editor Instance
   ============================ */
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle.configure({}),
      Color.configure({}),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: true,
        autolink: true,
      }),
      ImageResizer.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      VideoNode,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const clean = DOMPurify.sanitize(html, {
        ADD_TAGS: ['video', 'source', 'iframe', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'colgroup', 'col'],
        ADD_ATTR: ['controls', 'width', 'height', 'src', 'allow', 'allowfullscreen', 'frameborder', 'data-type', 'type', 'style', 'colspan', 'rowspan', 'data-float'],
      })
      autosave(clean)
      onChange?.(clean)
    },
    editorProps: {
      attributes: {
        class: 'max-w-none focus:outline-none',
        dir: dir,
      },
      handleDOMEvents: {
        click: (view, event) => {
          const target = event.target as HTMLElement
          if (target.tagName === 'IMG') {
            const img = target as HTMLImageElement
            const pos = view.posAtDOM(img, 0)
            
            // Find the node and its position
            let imagePos: number | null = null
            view.state.doc.nodesBetween(Math.max(0, pos - 2), pos + 2, (n, p) => {
              if (n.type.name === 'image') {
                imagePos = p
                return false
              }
            })

            if (imagePos !== null) {
              const rect = img.getBoundingClientRect()
              const container = document.querySelector('.editor-container') as HTMLElement | null
              const containerRect = container?.getBoundingClientRect()
              const editorRect = document.querySelector('.rich-text-editor')?.getBoundingClientRect()
              
              if (containerRect && editorRect && container) {
                // Position relative to the editor wrapper
                const cs = getComputedStyle(container)
                const padLeft = parseFloat(cs.paddingLeft) || 0
                const padTop = parseFloat(cs.paddingTop) || 0
                setSelectedImage({
                  pos: imagePos,
                  src: img.src,
                  x: rect.left - containerRect.left - padLeft,
                  y: rect.top - containerRect.top - padTop,
                  width: rect.width,
                  height: rect.height,
                })
              }
              event.preventDefault()
              return true
            }
          } else if (target.tagName === 'IFRAME' || target.tagName === 'VIDEO') {
            const el = target as HTMLIFrameElement | HTMLVideoElement
            const pos = view.posAtDOM(el, 0)
            let videoPos: number | null = null
            view.state.doc.nodesBetween(Math.max(0, pos - 2), pos + 2, (n, p) => {
              if (n.type.name === 'video') {
                videoPos = p
                return false
              }
            })
            if (videoPos !== null) {
              const rect = el.getBoundingClientRect()
              setSelectedVideo({
                pos: videoPos,
                src: (el as any).src || '',
                width: rect.width,
                height: rect.height,
              })
              setSelectedImage(null)
              event.preventDefault()
              return true
            }
          } else {
            setSelectedImage(null)
            setSelectedVideo(null)
          }
          return false
        },
        paste: (view, event) => {
          const items = event.clipboardData?.items

          if (!items) return false

          for (let i = 0; i < items.length; i++) {
            const item = items[i]

            if (item.type.startsWith('image/')) {
              const file = item.getAsFile()
              if (!file) return false

              // Handle image paste
              uploadImage(file)
                .then((url) => {
                  if (editor) {
                    editor
                      .chain()
                      .focus()
                      .insertContent({
                        type: 'paragraph',
                        content: [{
                          type: 'image',
                          attrs: {
                            src: url,
                            alt: file.name,
                            title: file.name,
                          },
                        }],
                      })
                      .run()
                  }
                })
                .catch((error) => {
                  console.error('Image paste failed:', error)
                })

              return true
            } else if (item.type.startsWith('video/')) {
              const file = item.getAsFile()
              if (!file) return false
              uploadVideo(file)
                .then((url) => {
                  if (editor) {
                    editor
                      .chain()
                      .focus()
                      .insertContent({
                        type: 'paragraph',
                        content: [{
                          type: 'video',
                          attrs: {
                            src: url,
                            controls: true,
                            type: 'video',
                          },
                        }],
                      })
                      .run()
                  }
                })
                .catch(() => {})
              return true
            }
          }

          return false
        },
        drop: (view, event) => {
          const items = event.dataTransfer?.items

          if (!items) return false

          for (let i = 0; i < items.length; i++) {
            const item = items[i]

            if (item.type.startsWith('image/')) {
              const file = item.getAsFile()
              if (!file) return false

              // Handle image drop
              uploadImage(file)
                .then((url) => {
                  if (editor) {
                    const coords = view.posAtCoords({
                      left: event.clientX,
                      top: event.clientY,
                    })

                    if (coords) {
                      editor
                        .chain()
                        .setTextSelection(coords.pos)
                        .insertContent({
                          type: 'paragraph',
                          content: [{
                            type: 'image',
                            attrs: {
                              src: url,
                              alt: file.name,
                              title: file.name,
                            },
                          }],
                        })
                        .run()
                    }
                  }
                })
                .catch((error) => {
                  console.error('Image drop failed:', error)
                })

              return true
            }
          }

          return false
        },
      },
    },
  })

  // Update editor content when value prop changes (e.g. switching tabs)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '')
    }
  }, [value, editor])

  /* ============================
     Image Click Detection & Positioning
   ============================ */
  const handleImageUpload = useCallback(async () => {
    if (!editor) return

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = false

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const url = await uploadImage(file)
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'paragraph',
            content: [{
              type: 'image',
              attrs: {
                src: url,
                alt: file.name,
                title: file.name,
              },
            }],
          })
          .run()
      } catch (error) {
        console.error('Image upload failed:', error)
        alert(t('uploadError'))
      }
    }

    input.click()
  }, [editor, uploadImage, t])

  /* ============================
     Delete Selected Image
   ============================ */
  const handleDeleteImage = useCallback(() => {
    if (!editor || !selectedImage) return
    
    // Find and delete the image node directly
    const { state } = editor.view
    let found = false
    state.doc.nodesBetween(0, state.doc.content.size, (node, pos) => {
      if (found) return false
      if (node.type.name === 'image' && pos === selectedImage.pos) {
        const tr = state.tr.delete(pos, pos + node.nodeSize)
        editor.view.dispatch(tr)
        found = true
      }
    })
    
    setSelectedImage(null)
  }, [editor, selectedImage])

  /* ============================
     Replace Selected Image
   ============================ */
  const handleReplaceImage = useCallback(async () => {
    if (!editor || !selectedImage) return

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = false

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const url = await uploadImage(file)
        
        // Find and update the image node directly
        const { state } = editor.view
        let found = false
        state.doc.nodesBetween(0, state.doc.content.size, (node, pos) => {
          if (found) return false
          if (node.type.name === 'image' && pos === selectedImage.pos) {
            const tr = state.tr.setNodeAttribute(pos, 'src', url)
            editor.view.dispatch(tr)
            found = true
          }
        })
        
        setSelectedImage(null)
      } catch (error) {
        console.error('Image replacement failed:', error)
        alert(t('replaceError'))
      }
    }

    input.click()
  }, [editor, selectedImage, uploadImage, t])

  /* ============================
      Resize Selected Image
    ============================ */
  const handleResizeImage = useCallback((newWidth: number, newHeight?: number) => {
    if (!editor || !selectedImage) return
    
    const { state } = editor.view
    let found = false
    state.doc.nodesBetween(0, state.doc.content.size, (node, pos) => {
      if (found) return false
      if (node.type.name === 'image' && pos === selectedImage.pos) {
        const isPercentage = newWidth === 100
        const tr = state.tr
          .setNodeAttribute(pos, 'width', isPercentage ? '100%' : newWidth)
        if (typeof newHeight === 'number') {
          tr.setNodeAttribute(pos, 'height', newHeight)
        }
        const styleVal = isPercentage ? 'width: 100%' : `width: ${newWidth}px`
        const finalStyle = typeof newHeight === 'number' ? `${styleVal}; height: ${newHeight}px` : styleVal
        tr.setNodeAttribute(pos, 'style', finalStyle)
        editor.view.dispatch(tr)
        
        setSelectedImage(prev => prev ? { ...prev, width: isPercentage ? 100 : newWidth } : null)
        found = true
      }
    })
    // Recompute rect to update height accurately
    const dom = editor.view.nodeDOM(selectedImage.pos) as HTMLElement | null
    const container = document.querySelector('.editor-container') as HTMLElement | null
    if (dom && container) {
      const rect = dom.getBoundingClientRect()
      const cr = container.getBoundingClientRect()
      const cs = getComputedStyle(container)
      const padLeft = parseFloat(cs.paddingLeft) || 0
      const padTop = parseFloat(cs.paddingTop) || 0
      setSelectedImage(prev => prev ? {
        ...prev,
        x: rect.left - cr.left - padLeft,
        y: rect.top - cr.top - padTop,
        width: rect.width,
        height: rect.height,
      } : null)
    }
  }, [editor, selectedImage])

  /* ============================
      Reset Image Size
    ============================ */
  const handleResetSize = useCallback(() => {
    if (!editor || !selectedImage) return
    
    const { state } = editor.view
    let found = false
    state.doc.nodesBetween(0, state.doc.content.size, (node, pos) => {
      if (found) return false
      if (node.type.name === 'image' && pos === selectedImage.pos) {
        const tr = state.tr
          .setNodeAttribute(pos, 'width', null)
          .setNodeAttribute(pos, 'style', null)
        editor.view.dispatch(tr)
        
        // Update local state to reflect reset
        setSelectedImage(prev => prev ? { ...prev, width: prev.width } : null)
        found = true
      }
    })
  }, [editor, selectedImage])

  const handleInsertVideoUrl = useCallback(() => {
    if (!editor) return
    const raw = prompt('Enter video URL')
    if (!raw) return
    const norm = normalizeVideoUrl(raw)
    if (!norm) {
      alert('Unsupported video URL')
      return
    }
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'paragraph',
        content: [{
          type: 'video',
          attrs: {
            src: norm.src,
            controls: norm.type === 'video' ? true : undefined,
            type: norm.type,
          },
        }],
      })
      .run()
  }, [editor])

  const handleUploadVideoFile = useCallback(() => {
    if (!editor) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'video/*'
    input.multiple = false
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const url = await uploadVideo(file)
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'paragraph',
            content: [{
              type: 'video',
              attrs: {
                src: url,
                controls: true,
                type: 'video',
              },
            }],
          })
          .run()
      } catch {}
    }
    input.click()
  }, [editor, uploadVideo])

  const handleResizeVideo = useCallback((newWidth: number) => {
    if (!editor || !selectedVideo) return
    const { state } = editor.view
    let found = false
    state.doc.nodesBetween(0, state.doc.content.size, (node, pos) => {
      if (found) return false
      if (node.type.name === 'video' && pos === selectedVideo.pos) {
        const tr = state.tr.setNodeAttribute(pos, 'width', newWidth)
        editor.view.dispatch(tr)
        setSelectedVideo(prev => prev ? { ...prev, width: newWidth } : null)
        found = true
      }
    })
  }, [editor, selectedVideo])

  const handleResetVideoSize = useCallback(() => {
    if (!editor || !selectedVideo) return
    const { state } = editor.view
    let found = false
    state.doc.nodesBetween(0, state.doc.content.size, (node, pos) => {
      if (found) return false
      if (node.type.name === 'video' && pos === selectedVideo.pos) {
        const tr = state.tr.setNodeAttribute(pos, 'width', null).setNodeAttribute(pos, 'height', null)
        editor.view.dispatch(tr)
        setSelectedVideo(prev => prev ? { ...prev, width: prev.width, height: prev.height } : null)
        found = true
      }
    })
  }, [editor, selectedVideo])

  const handleSetImageFloat = useCallback((floatVal: 'none' | 'left' | 'right') => {
    if (!editor || !selectedImage) return
    const { state } = editor.view
    let found = false
    state.doc.nodesBetween(0, state.doc.content.size, (node, pos) => {
      if (found) return false
      if (node.type.name === 'image' && pos === selectedImage.pos) {
        const tr = state.tr.setNodeAttribute(pos, 'dataFloat', floatVal)
        editor.view.dispatch(tr)
        found = true
      }
    })
  }, [editor, selectedImage])

  const handleSetVideoFloat = useCallback((floatVal: 'none' | 'left' | 'right') => {
    if (!editor || !selectedVideo) return
    const { state } = editor.view
    let found = false
    state.doc.nodesBetween(0, state.doc.content.size, (node, pos) => {
      if (found) return false
      if (node.type.name === 'video' && pos === selectedVideo.pos) {
        const tr = state.tr.setNodeAttribute(pos, 'dataFloat', floatVal)
        editor.view.dispatch(tr)
        found = true
      }
    })
  }, [editor, selectedVideo])

  /* ============================
     Delete Selected Video
  ============================ */
  const handleDeleteVideo = useCallback(() => {
    if (!editor || !selectedVideo) return
    
    // Find and delete the video node directly
    const { state } = editor.view
    let found = false
    state.doc.nodesBetween(0, state.doc.content.size, (node, pos) => {
      if (found) return false
      if (node.type.name === 'video' && pos === selectedVideo.pos) {
        const tr = state.tr.delete(pos, pos + node.nodeSize)
        editor.view.dispatch(tr)
        found = true
      }
    })
    
    setSelectedVideo(null)
  }, [editor, selectedVideo])


  if (!editor) {
    return null
  }
  // Helper to apply editor commands without causing page scroll
  const applyFormat = (callback: (chain: any) => any) => {
    // Store current scroll position
    const scrollPos = window.scrollY
    
    // Apply the format command
    callback(editor.chain())
    
    // Restore scroll position after a small delay to let the browser settle
    setTimeout(() => {
      window.scrollTo(window.scrollX, scrollPos)
    }, 0)
  }
  
  // Helper to apply mark without scrolling
  const applyMark = (markName: string, attrs?: Record<string, any>) => {
    const scrollPos = window.scrollY
    if (attrs) {
      editor.chain().focus().setMark(markName, attrs).run()
    } else {
      editor.chain().focus().unsetMark(markName).run()
    }
    setTimeout(() => {
      window.scrollTo(window.scrollX, scrollPos)
    }, 0)
  }
  
  const applyFontSize = (size: string) => {
    if (!editor) return
    
    // Get current textStyle attributes
    const currentAttrs = editor.getAttributes('textStyle')
    const currentStyle = currentAttrs.style || ''
    
    // Parse existing styles
    const styles: Record<string, string> = {}
    if (currentStyle) {
      currentStyle.split(';').forEach((rule: string) => {
        const [key, value] = rule.split(':').map((x: string) => x.trim())
        if (key && value) {
          styles[key] = value
        }
      })
    }
    
    // Update font-size
    if (size) {
      styles['font-size'] = size
    } else {
      delete styles['font-size']
    }
    
    // Build new style string
    const newStyle = Object.entries(styles)
      .map(([k, v]) => `${k}: ${v}`)
      .join('; ')
    
    // Store scroll position
    const scrollPos = window.scrollY
    
    // Apply the mark
    if (newStyle) {
      editor.chain().focus().setMark('textStyle', { style: newStyle }).run()
    } else {
      // If no styles left, unset the mark
      editor.chain().focus().unsetMark('textStyle').run()
    }
    
    // Restore scroll position
    setTimeout(() => {
      window.scrollTo(window.scrollX, scrollPos)
    }, 0)
  }
  return (
    <div className="rich-text-editor">
      {label && (
        <label className="editor-label">
          {label}
        </label>
      )}
      
      {/* Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }}
            className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
            title={t('h1')}
          >
            H1
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }}
            className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
            title={t('h2')}
          >
            H2
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }}
            className={`toolbar-btn ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
            title={t('h3')}
          >
            H3
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor.chain().focus().toggleHeading({ level: 4 }).run()
            }}
            className={`toolbar-btn ${editor.isActive('heading', { level: 4 }) ? 'active' : ''}`}
            title={t('h4')}
          >
            H4
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor.chain().focus().toggleHeading({ level: 5 }).run()
            }}
            className={`toolbar-btn ${editor.isActive('heading', { level: 5 }) ? 'active' : ''}`}
            title={t('h5')}
          >
            H5
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor.chain().focus().toggleHeading({ level: 6 }).run()
            }}
            className={`toolbar-btn ${editor.isActive('heading', { level: 6 }) ? 'active' : ''}`}
            title={t('h6')}
          >
            H6
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }}
            className="toolbar-btn"
            title="إدراج جدول"
          >
            ⇱ جدول
          </button>
          {editor.isActive('table') && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  editor.chain().focus().addRowBefore().run()
                }}
                className="toolbar-btn"
                title="إضافة صف قبل"
              >
                ⤴ صف
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  editor.chain().focus().addRowAfter().run()
                }}
                className="toolbar-btn"
                title="إضافة صف بعد"
              >
                ⤵ صف
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  editor.chain().focus().addColumnBefore().run()
                }}
                className="toolbar-btn"
                title="إضافة عمود قبل"
              >
                ⬅ عمود
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  editor.chain().focus().addColumnAfter().run()
                }}
                className="toolbar-btn"
                title="إضافة عمود بعد"
              >
                ➡ عمود
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  editor.chain().focus().deleteRow().run()
                }}
                className="toolbar-btn"
                title="حذف صف"
              >
                ⓧ صف
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  editor.chain().focus().deleteColumn().run()
                }}
                className="toolbar-btn"
                title="حذف عمود"
              >
                ⓧ عمود
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  editor.chain().focus().mergeCells().run()
                }}
                className="toolbar-btn"
                title="دمج الخلايا"
              >
                ⇔ دمج
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  editor.chain().focus().splitCell().run()
                }}
                className="toolbar-btn"
                title="فصل الخلايا"
              >
                ⇍ فصل
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  editor.chain().focus().toggleHeaderRow().run()
                }}
                className="toolbar-btn"
                title="تبديل صف عناوين"
              >
                ⓗ عناوين
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  editor.chain().focus().deleteTable().run()
                }}
                className="toolbar-btn delete-btn"
                title="حذف الجدول"
              >
                🗑 جدول
              </button>
            </>
          )}
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor.chain().focus().setTextAlign('left').run()
            }}
            className={`toolbar-btn ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
            title="محاذاة يسار"
          >
            ⬅️
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor.chain().focus().setTextAlign('center').run()
            }}
            className={`toolbar-btn ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
            title="محاذاة وسط"
          >
            ⏺
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor.chain().focus().setTextAlign('right').run()
            }}
            className={`toolbar-btn ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
            title="محاذاة يمين"
          >
            ➡️
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor.chain().focus().setTextAlign('justify').run()
            }}
            className={`toolbar-btn ${editor.isActive({ textAlign: 'justify' }) ? 'active' : ''}`}
            title="ضبط النص"
          >
            ☰
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor.chain().focus().toggleBold().run()
            }}
            className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
            title={t('bold')}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor.chain().focus().toggleItalic().run()
            }}
            className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
            title={t('italic')}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor.chain().focus().toggleStrike().run()
            }}
            className={`toolbar-btn ${editor.isActive('strike') ? 'active' : ''}`}
            title={t('strike')}
          >
            <s>S</s>
          </button>
          <input
            type="color"
            onChange={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor.chain().focus().setColor(e.target.value).run()
            }}
            className="toolbar-btn"
            title="لون النص"
            style={{ padding: '0.45rem', width: '38px', minWidth: '38px' }}
          />
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor.chain().focus().toggleBulletList().run()
            }}
            className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
            title={t('bulletList')}
          >
            • {t('list')}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor.chain().focus().toggleOrderedList().run()
            }}
            className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
            title={t('orderedList')}
          >
            1. {t('list')}
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleImageUpload()
            }}
            className="toolbar-btn"
            title={t('insertImage')}
          >
            🖼️ {t('image')}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              const url = prompt(t('enterUrl'))
              if (url) {
                editor
                  .chain()
                  .focus()
                  .extendMarkRange('link')
                  .setLink({ href: url })
                  .run()
              }
            }}
            className={`toolbar-btn ${editor.isActive('link') ? 'active' : ''}`}
            title={t('link')}
          >
            🔗 {t('link')}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleInsertVideoUrl()
            }}
            className="toolbar-btn"
            title="Insert Video URL"
          >
            🎥 Video URL
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleUploadVideoFile()
            }}
            className="toolbar-btn"
            title="Upload Video"
          >
            ⬆️ Video
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor.chain().focus().clearNodes().run()
            }}
            className="toolbar-btn"
            title={t('clear')}
          >
            {t('clearText')}
          </button>
        </div>

        {/* Image Actions - Appear next to toolbar when image is selected */}
        {selectedImage && (
          <>
            <div className="toolbar-divider" />
            <div className="toolbar-group image-actions-group">
              <span className="image-actions-label">{t('imageLabel')}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleResizeImage(Math.max(100, (selectedImage.width || 300) - 50))
                }}
                className="toolbar-btn image-action-btn"
                title={t('smaller')}
              >
                −
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleResizeImage((selectedImage.width || 300) + 50)
                }}
                className="toolbar-btn image-action-btn"
                title={t('larger')}
              >
                +
              </button>
              <select
                value={selectedImage.width && selectedImage.width < 100 ? '' : selectedImage.width || ''}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === '100%') {
                    handleResizeImage(100)
                  } else {
                    handleResizeImage(Number(val))
                  }
                }}
                className="toolbar-btn image-action-btn resize-select"
                style={{ padding: '0.5rem', minWidth: '80px' }}
              >
                <option value="">{t('size')}</option>
                <option value="200">200px</option>
                <option value="300">300px</option>
                <option value="400">400px</option>
                <option value="500">500px</option>
                <option value="600">600px</option>
                <option value="700">700px</option>
                <option value="800">800px</option>
                <option value="100%">100%</option>
              </select>
              <input
                type="number"
                min="50"
                max="2000"
                placeholder="px"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customWidth) {
                    e.preventDefault()
                    e.stopPropagation()
                    const width = Number(customWidth)
                    if (width >= 50 && width <= 2000) {
                      handleResizeImage(width)
                      setCustomWidth('')
                    }
                  }
                }}
                className="toolbar-btn image-action-btn"
                style={{ padding: '0.5rem', width: '70px', minWidth: '70px' }}
                title={t('customWidth') || 'Custom width (px)'}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (customWidth) {
                    const width = Number(customWidth)
                    if (width >= 50 && width <= 2000) {
                      handleResizeImage(width)
                      setCustomWidth('')
                    }
                  }
                }}
                className="toolbar-btn image-action-btn"
                title={t('applyWidth') || 'Apply'}
                disabled={!customWidth}
              >
                ✓
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleResetSize()
                }}
                className="toolbar-btn image-action-btn"
                title={t('resetSize')}
              >
                ⇄
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleSetImageFloat('left')
                }}
                className="toolbar-btn image-action-btn"
                title={t('floatLeft') || 'Float left'}
              >
                ⬅️
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleSetImageFloat('none')
                }}
                className="toolbar-btn image-action-btn"
                title={t('floatCenter') || 'Center'}
              >
                ⏺
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleSetImageFloat('right')
                }}
                className="toolbar-btn image-action-btn"
                title={t('floatRight') || 'Float right'}
              >
                ➡️
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleReplaceImage()
                }}
                className="toolbar-btn image-action-btn"
                title={t('replaceImage')}
              >
                ↻
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleDeleteImage()
                }}
                className="toolbar-btn image-action-btn delete-btn"
                title={t('deleteImage')}
              >
                🗑️
              </button>
            </div>
          </>
        )}
        {selectedVideo && (
          <>
            <div className="toolbar-divider" />
            <div className="toolbar-group image-actions-group">
              <span className="image-actions-label">Video</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleResizeVideo(Math.max(200, (selectedVideo.width || 400) - 50))
                }}
                className="toolbar-btn image-action-btn"
                title="Smaller"
              >
                −
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleResizeVideo((selectedVideo.width || 400) + 50)
                }}
                className="toolbar-btn image-action-btn"
                title="Larger"
              >
                +
              </button>
              <select
                value={selectedVideo.width || ''}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  handleResizeVideo(val)
                }}
                className="toolbar-btn image-action-btn resize-select"
                style={{ padding: '0.5rem', minWidth: '80px' }}
              >
                <option value="">{t('size')}</option>
                <option value="240">240px</option>
                <option value="320">320px</option>
                <option value="480">480px</option>
                <option value="640">640px</option>
                <option value="800">800px</option>
              </select>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleResetVideoSize()
                }}
                className="toolbar-btn image-action-btn"
                title="Reset size"
              >
                ⇄
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleSetVideoFloat('left')
                }}
                className="toolbar-btn image-action-btn"
                title="Float left"
              >
                ⬅️
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleSetVideoFloat('none')
                }}
                className="toolbar-btn image-action-btn"
                title="No float"
              >
                ⏺
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleSetVideoFloat('right')
                }}
                className="toolbar-btn image-action-btn"
                title="Float right"
              >
                ➡️
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleDeleteVideo()
                }}
                className="toolbar-btn image-action-btn delete-btn"
                title="Delete Video"
              >
                🗑️
              </button>
            </div>
          </>
        )}
      </div>

      {/* Editor */}
      <div className="editor-container">
        <EditorContent editor={editor} />
      </div>

      {/* Info */}
      <div className="editor-info">
        💡 {t('tip')}
      </div>
    </div>
  )
}
