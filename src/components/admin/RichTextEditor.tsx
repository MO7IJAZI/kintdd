'use client'

import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
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

/**
 * Image Resizer Extension for Tiptap
 * Allows resizing and repositioning of images inline
 */
const ImageResizer = Image.extend({
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
    }
  },
})

export default function RichTextEditor({
  label,
  value = '',
  onChange,
  autosaveKey,
  dir = 'ltr',
}: Props) {
  const t = useTranslations('AdminRichText')
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null)
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

  /* ============================
     Tiptap Editor Instance
   ============================ */
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
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
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const clean = DOMPurify.sanitize(html)
      
      autosave(clean)
      onChange?.(clean)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
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
              const container = document.querySelector('.editor-container')
              const containerRect = container?.getBoundingClientRect()
              const editorRect = document.querySelector('.rich-text-editor')?.getBoundingClientRect()
              
              if (containerRect && editorRect) {
                // Position relative to the editor wrapper
                setSelectedImage({
                  pos: imagePos,
                  src: img.src,
                  x: editorRect.width - 8, // Right edge with small margin
                  y: rect.top - editorRect.top + (rect.height / 2), // Vertically centered on image
                  width: rect.width,
                  height: rect.height,
                })
              }
              event.preventDefault()
            }
          } else {
            setSelectedImage(null)
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
                        type: 'image',
                        attrs: {
                          src: url,
                          alt: file.name,
                          title: file.name,
                        },
                      })
                      .run()
                  }
                })
                .catch((error) => {
                  console.error('Image paste failed:', error)
                })

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
                          type: 'image',
                          attrs: {
                            src: url,
                            alt: file.name,
                            title: file.name,
                          },
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
            type: 'image',
            attrs: {
              src: url,
              alt: file.name,
              title: file.name,
            },
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
  const handleResizeImage = useCallback((newWidth: number) => {
    if (!editor || !selectedImage) return
    
    const { state } = editor.view
    let found = false
    state.doc.nodesBetween(0, state.doc.content.size, (node, pos) => {
      if (found) return false
      if (node.type.name === 'image' && pos === selectedImage.pos) {
        const isPercentage = newWidth === 100
        const tr = state.tr
          .setNodeAttribute(pos, 'width', isPercentage ? '100%' : newWidth)
          .setNodeAttribute(pos, 'style', isPercentage ? 'width: 100%' : `width: ${newWidth}px`)
        editor.view.dispatch(tr)
        
        // Update local state
        setSelectedImage(prev => prev ? { ...prev, width: isPercentage ? 100 : newWidth } : null)
        found = true
      }
    })
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

  if (!editor) {
    return null
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
