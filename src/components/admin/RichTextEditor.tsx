'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Editor as TinyMCEEditor } from '@tinymce/tinymce-react'
import DOMPurify from 'dompurify'
import debounce from 'lodash.debounce'
import { useTranslations } from 'next-intl'

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

export default function RichTextEditor({
  label,
  value = '',
  onChange,
  autosaveKey,
  dir = 'ltr',
}: Props) {
  const t = useTranslations('AdminRichText')
  const [localContent, setLocalContent] = useState<string>(value || '')
  const [stats, setStats] = useState({ words: 0, chars: 0, lines: 1 })
  const [editorLoadError, setEditorLoadError] = useState<string | null>(null)
  const editorValue = onChange ? value : localContent

  /* ── Custom font upload state ── */
  const [customFonts, setCustomFonts] = useState<{ name: string; url: string }[]>([])

  useEffect(() => {
    fetch('/api/fonts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCustomFonts(data)
      })
      .catch(console.error)
  }, [])

  const uploadAsset = useCallback(async (file: Blob, fileName = 'upload-file') => {
    const formData = new FormData()
    formData.append('file', file, fileName)
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) throw new Error('Upload failed')
    const data = await response.json() as { url?: string }
    if (!data?.url) throw new Error('Invalid upload response')
    return data.url
  }, [])

  const autosave = useMemo(
    () =>
      debounce((html: string) => {
        if (autosaveKey) localStorage.setItem(autosaveKey, html)
      }, 800),
    [autosaveKey]
  )

  useEffect(() => {
    return () => { autosave.cancel() }
  }, [autosave])

  const updateStats = (html: string) => {
    const plain = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    const words = plain ? plain.split(' ').length : 0
    const chars = plain.length
    const lines = Math.max(1, html.split(/\n|<br\s*\/?>/i).length)
    setStats({ words, chars, lines })
  }

  /* ─── Build @font-face CSS for custom uploaded fonts ─── */
  const customFontCss = customFonts.map(f =>
    `@font-face { font-family: '${f.name}'; src: url('${f.url}'); } `
  ).join('')

  /* ─── List of font families including custom ones ─── */
  const fontFamilyFormats = [
    'Inter=Inter,sans-serif',
    'Arial=arial,helvetica,sans-serif',
    'Tahoma=tahoma,arial,helvetica,sans-serif',
    'Georgia=georgia,serif',
    'Times New Roman=times new roman,times,serif',
    'Courier New=courier new,courier,monospace',
    ...customFonts.map(f => `${f.name}=${f.name},sans-serif`),
  ].join(';')

  return (
    <div className="rich-text-editor-wrapper" dir={dir === 'auto' ? undefined : dir}>
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
          id="custom-font-name"
          placeholder={t('fontName') ?? 'اسم الخط (مثال: Cairo)'}
          style={{
            padding: '0.35rem 0.6rem', borderRadius: '6px',
            border: '1px solid #cbd5e1', fontSize: '0.82rem',
            flex: 1, minWidth: '120px',
          }}
        />
        <label style={{
          padding: '0.35rem 0.9rem', borderRadius: '6px',
          background: '#e9496c', color: 'white', fontWeight: 700,
          fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap',
        }}>
          {t('chooseFont') ?? 'اختر ملف الخط'}
          <input
            type="file"
            accept=".ttf,.otf,.woff,.woff2"
            style={{ display: 'none' }}
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const nameInput = document.getElementById('custom-font-name') as HTMLInputElement
              const fontName = nameInput?.value?.trim() || file.name.replace(/\.[^.]+$/, '')
              try {
                const url = await uploadAsset(file, file.name)
                const res = await fetch('/api/fonts', {
                  method: 'POST',
                  body: JSON.stringify({ name: fontName, url }),
                  headers: { 'Content-Type': 'application/json' }
                })
                if (res.ok) {
                  const data = await res.json()
                  setCustomFonts(data)
                }
                if (nameInput) nameInput.value = ''
              } catch {
                setEditorLoadError('فشل رفع الخط')
              }
            }}
          />
        </label>
      </div>

      <TinyMCEEditor
        key={fontFamilyFormats}
        tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@7.7.1/tinymce.min.js"
        licenseKey="gpl"
        value={editorValue}
        onInit={() => setEditorLoadError(null)}
        init={{
          height: 560,
          min_height: 420,
          max_height: 1100,
          menubar: 'file edit view insert format tools table help',
          branding: false,
          promotion: false,
          skin: 'oxide',
          content_css: 'default',
          directionality: dir === 'rtl' ? 'rtl' : 'ltr',
          toolbar_mode: 'wrap',
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'codesample', 'fullscreen',
            'insertdatetime', 'directionality', 'nonbreaking', 'pagebreak',
            'quickbars', 'save', 'visualchars', 'emoticons', 'autoresize',
            'media', 'table', 'wordcount',
          ],
          automatic_uploads: true,
          images_file_types: 'jpg,jpeg,png,gif,webp,svg',
          file_picker_types: 'image media',
          toolbar: [
            'undo redo | fontfamily fontsize blocks | bold italic underline strikethrough forecolor backcolor',
            'alignleft aligncenter alignright alignjustify | ltr rtl | bullist numlist outdent indent',
            'uploadImage uploadVideo mediaSize25 mediaSize50 mediaSize75 mediaSize100 mediaSizeAuto | wrapImageLeft wrapImageRight clearWrap',
            'link image media emoticons charmap pagebreak nonbreaking',
            'table tabledelete | tableprops tablerowprops tablecellprops | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol | tablecellbackgroundcolor tablebordercolor | tablemergecells tablesplitcells',
            'codeTools codesample code visualblocks visualchars fullscreen preview | removeformat',
          ].join(' | '),
          quickbars_selection_toolbar: 'bold italic underline | forecolor backcolor | blocks | link | codesample',
          quickbars_insert_toolbar: 'quickimage quicktable pagebreak',
          contextmenu: 'kintmedia kinttable kintlink kinttext',
          quickbars_image_toolbar: 'alignleft aligncenter alignright | imageoptions',

          /* ── Paste options: preserve all inline styles & colors ── */
          paste_data_images: true,
          paste_as_text: false,
          paste_merge_formats: false,
          smart_paste: false,
          paste_webkit_styles: 'all',
          paste_retain_style_properties: 'all',
          paste_remove_styles_if_webkit: false,

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
          object_resizing: true,
          resize_img_proportional: true,

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

          setup: (editor) => {
            const getClosest = (element: Element | null, selector: string) =>
              element?.closest(selector) as HTMLElement | null

            /* ── Add custom fonts to editor body dynamically ── */
            editor.on('init', () => {
              if (customFontCss) {
                editor.dom.addStyle(customFontCss)
              }
            })

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
              tooltip: 'إدراج جدول',
              onAction: () => {
                const rows = parseInt(prompt('عدد الصفوف:', '3') || '3', 10) || 3
                const cols = parseInt(prompt('عدد الأعمدة:', '3') || '3', 10) || 3
                let html = '<table border="1" style="width:100%;border-collapse:collapse;border:1px solid #64748b;"><colgroup>'
                for (let c = 0; c < cols; c++) html += `<col style="width:${Math.round(100 / cols)}%">`
                html += '</colgroup><thead><tr>'
                for (let c = 0; c < cols; c++) html += `<th style="padding:8px 10px;background:#f8fafc;font-weight:700;">Header ${c + 1}</th>`
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

            /* ── Wrap image left / right (text beside image) ── */
            editor.ui.registry.addButton('wrapImageLeft', {
              icon: 'align-left',
              tooltip: 'نص بجانب الصورة (يسار)',
              onAction: () => {
                const node = editor.selection.getNode() as HTMLElement
                const img = node.tagName === 'IMG' ? node : (node.querySelector('img') as HTMLElement)
                if (!img) return
                img.style.float = 'left'
                img.style.margin = '0 1rem 0.5rem 0'
                img.style.maxWidth = '45%'
                editor.nodeChanged()
              },
            })
            editor.ui.registry.addButton('wrapImageRight', {
              icon: 'align-right',
              tooltip: 'نص بجانب الصورة (يمين)',
              onAction: () => {
                const node = editor.selection.getNode() as HTMLElement
                const img = node.tagName === 'IMG' ? node : (node.querySelector('img') as HTMLElement)
                if (!img) return
                img.style.float = 'right'
                img.style.margin = '0 0 0.5rem 1rem'
                img.style.maxWidth = '45%'
                editor.nodeChanged()
              },
            })
            editor.ui.registry.addButton('clearWrap', {
              icon: 'remove',
              tooltip: 'إلغاء التفاف النص',
              onAction: () => {
                const node = editor.selection.getNode() as HTMLElement
                const img = node.tagName === 'IMG' ? node : (node.querySelector('img') as HTMLElement)
                if (!img) return
                img.style.float = ''
                img.style.margin = ''
                img.style.maxWidth = ''
                editor.nodeChanged()
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
                  node.setAttribute('src', url)
                  if (tag === 'IMG') node.setAttribute('alt', file.name)
                  editor.nodeChanged()
                } catch {
                  setEditorLoadError('فشل استبدال الملف')
                }
              }
              input.click()
            }

            const setSelectedMediaWidth = (value: '25' | '50' | '75' | '100' | 'auto') => {
              const node = editor.selection.getNode() as HTMLElement | null
              if (!node) return
              const tag = node.tagName
              if (tag !== 'IMG' && tag !== 'VIDEO' && tag !== 'IFRAME') return
              if (value === 'auto') {
                node.style.removeProperty('width')
                node.style.removeProperty('height')
                node.removeAttribute('width')
                node.removeAttribute('height')
              } else {
                node.style.width = `${value}%`
                node.style.height = 'auto'
                node.removeAttribute('width')
                node.removeAttribute('height')
              }
              editor.nodeChanged()
            }

            editor.ui.registry.addButton('mediaSize25', { text: '25%', tooltip: 'حجم 25%', onAction: () => setSelectedMediaWidth('25') })
            editor.ui.registry.addButton('mediaSize50', { text: '50%', tooltip: 'حجم 50%', onAction: () => setSelectedMediaWidth('50') })
            editor.ui.registry.addButton('mediaSize75', { text: '75%', tooltip: 'حجم 75%', onAction: () => setSelectedMediaWidth('75') })
            editor.ui.registry.addButton('mediaSize100', { text: '100%', tooltip: 'حجم 100%', onAction: () => setSelectedMediaWidth('100') })
            editor.ui.registry.addButton('mediaSizeAuto', { text: 'Auto', tooltip: 'الحجم الأصلي', onAction: () => setSelectedMediaWidth('auto') })

            editor.ui.registry.addMenuItem('kintEditMedia', { text: 'تحرير الوسائط', onAction: () => { const node = editor.selection.getNode() as HTMLElement | null; if (!node) return; if (node.tagName === 'IMG') editor.execCommand('mceImage'); else editor.execCommand('mceMedia') } })
            editor.ui.registry.addMenuItem('kintReplaceMedia', { text: 'استبدال الملف', onAction: () => { void replaceSelectedMediaSource() } })
            editor.ui.registry.addMenuItem('kintMedia25', { text: 'حجم 25%', onAction: () => setSelectedMediaWidth('25') })
            editor.ui.registry.addMenuItem('kintMedia50', { text: 'حجم 50%', onAction: () => setSelectedMediaWidth('50') })
            editor.ui.registry.addMenuItem('kintMedia75', { text: 'حجم 75%', onAction: () => setSelectedMediaWidth('75') })
            editor.ui.registry.addMenuItem('kintMedia100', { text: 'حجم 100%', onAction: () => setSelectedMediaWidth('100') })
            editor.ui.registry.addMenuItem('kintMediaAuto', { text: 'الحجم الأصلي', onAction: () => setSelectedMediaWidth('auto') })
            editor.ui.registry.addMenuItem('kintRemoveNode', { text: 'حذف العنصر', onAction: () => { const node = editor.selection.getNode(); if (node) node.remove(); editor.nodeChanged() } })

            editor.ui.registry.addMenuItem('kintTableProps', { text: 'خصائص الجدول', onAction: () => editor.execCommand('mceTableProps') })
            editor.ui.registry.addMenuItem('kintTableInsertRowBefore', { text: 'إدراج صف قبل', onAction: () => editor.execCommand('mceTableInsertRowBefore') })
            editor.ui.registry.addMenuItem('kintTableInsertRowAfter', { text: 'إدراج صف بعد', onAction: () => editor.execCommand('mceTableInsertRowAfter') })
            editor.ui.registry.addMenuItem('kintTableDeleteRow', { text: 'حذف الصف', onAction: () => editor.execCommand('mceTableDeleteRow') })
            editor.ui.registry.addMenuItem('kintTableInsertColBefore', { text: 'إدراج عمود قبل', onAction: () => editor.execCommand('mceTableInsertColBefore') })
            editor.ui.registry.addMenuItem('kintTableInsertColAfter', { text: 'إدراج عمود بعد', onAction: () => editor.execCommand('mceTableInsertColAfter') })
            editor.ui.registry.addMenuItem('kintTableDeleteCol', { text: 'حذف العمود', onAction: () => editor.execCommand('mceTableDeleteCol') })
            editor.ui.registry.addMenuItem('kintTableDelete', { text: 'حذف الجدول', onAction: () => editor.execCommand('mceTableDelete') })
            editor.ui.registry.addMenuItem('kintTableMerge', { text: 'دمج الخلايا', onAction: () => editor.execCommand('mceTableMergeCells') })
            editor.ui.registry.addMenuItem('kintTableSplit', { text: 'تقسيم الخلايا', onAction: () => editor.execCommand('mceTableSplitCells') })

            editor.ui.registry.addMenuItem('kintEditLink', { text: 'تحرير الرابط', onAction: () => editor.execCommand('mceLink') })
            editor.ui.registry.addMenuItem('kintUnlink', { text: 'إزالة الرابط', onAction: () => editor.execCommand('unlink') })
            editor.ui.registry.addMenuItem('kintCopyLink', {
              text: 'نسخ الرابط',
              onAction: async () => {
                const node = editor.selection.getNode() as HTMLElement | null
                const anchor = getClosest(node, 'a')
                const href = anchor?.getAttribute('href')
                if (!href) return
                try { await navigator.clipboard.writeText(href) } catch {}
              },
            })

            editor.ui.registry.addMenuItem('kintBold', { text: 'غامق', onAction: () => editor.execCommand('Bold') })
            editor.ui.registry.addMenuItem('kintItalic', { text: 'مائل', onAction: () => editor.execCommand('Italic') })
            editor.ui.registry.addMenuItem('kintUnderline', { text: 'تسطير', onAction: () => editor.execCommand('Underline') })
            editor.ui.registry.addMenuItem('kintTextCode', { text: 'كتلة كود', onAction: () => editor.execCommand('mceCodeSample') })
            editor.ui.registry.addMenuItem('kintTextClear', { text: 'مسح التنسيق', onAction: () => editor.execCommand('RemoveFormat') })

            editor.ui.registry.addContextMenu('kintmedia', {
              update: (element) => {
                const media = getClosest(element, 'img,video,iframe')
                return media ? 'kintEditMedia kintReplaceMedia | kintMedia25 kintMedia50 kintMedia75 kintMedia100 kintMediaAuto | kintRemoveNode' : ''
              },
            })
            editor.ui.registry.addContextMenu('kinttable', {
              update: (element) => {
                const table = getClosest(element, 'table')
                return table ? 'kintTableProps | kintTableInsertRowBefore kintTableInsertRowAfter kintTableDeleteRow | kintTableInsertColBefore kintTableInsertColAfter kintTableDeleteCol | kintTableMerge kintTableSplit | kintTableDelete' : ''
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
            editor.ui.registry.addContextToolbar('mediaResizeToolbar', {
              predicate: (node) => {
                const tag = (node as HTMLElement).tagName
                return tag === 'IMG' || tag === 'VIDEO' || tag === 'IFRAME'
              },
              items: 'mediaSize25 mediaSize50 mediaSize75 mediaSize100 mediaSizeAuto',
              position: 'node',
              scope: 'node',
            })

            editor.ui.registry.addButton('uploadImage', {
              icon: 'image',
              tooltip: 'رفع صورة',
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
                    setEditorLoadError('فشل رفع الصورة')
                  }
                }
                input.click()
              },
            })

            editor.ui.registry.addButton('uploadVideo', {
              icon: 'embed',
              tooltip: 'رفع فيديو / رابط YouTube',
              onAction: () => {
                const choice = prompt('اختر: (1) رفع ملف فيديو، (2) رابط YouTube\nأدخل رابط YouTube مباشرةً أو اضغط إلغاء لرفع ملف:')
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
                      setEditorLoadError('فشل رفع الفيديو')
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
            body {
              font-family: Inter, system-ui, sans-serif;
              font-size: 16px;
              line-height: 1.7;
              color: #334155;
              padding: 14px;
              direction: ${dir === 'rtl' ? 'rtl' : 'ltr'};
            }
            /* Preserve all inline colors and styles on paste */
            * { }
            table { border-collapse: collapse; width: 100%; border: 1px solid #64748b; }
            tbody, thead, tfoot, tr, th, td { border-color: inherit; border-style: inherit; border-width: inherit; }
            table th, table td { padding: 10px 12px; }
            table th { background: #f8fafc; font-weight: 700; }
            pre[class*="language-"] { background: #0f172a; color: #e2e8f0; padding: 14px; border-radius: 10px; overflow-x: auto; }
            code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace; }
            img, video, iframe { max-width: 100%; }
            img[data-mce-selected], video[data-mce-selected], iframe[data-mce-selected] { outline: 2px solid #3b82f6; outline-offset: 2px; }
            /* Float support for text beside images */
            img[style*="float: left"], img[style*="float:left"] { margin: 0 1rem 0.5rem 0; }
            img[style*="float: right"], img[style*="float:right"] { margin: 0 0 0.5rem 1rem; }
          `,
        }}
        onEditorChange={(html) => {
          const clean = DOMPurify.sanitize(html, {
            ADD_TAGS: ['video', 'source', 'iframe', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'colgroup', 'col', 'span', 'font', 'style'],
            ADD_ATTR: [
              'controls', 'width', 'height', 'src', 'allow', 'allowfullscreen', 'frameborder',
              'data-type', 'type', 'style', 'colspan', 'rowspan', 'data-float',
              'data-border-color', 'data-border-width', 'border', 'cellpadding', 'cellspacing',
              'class', 'id', 'dir', 'lang', 'color', 'bgcolor', 'align', 'valign', 'face', 'size',
              'data-mce-style', 'data-mce-selected',
            ],
            PARSER_MEDIA_TYPE: 'text/html',
            FORCE_BODY: false,
            WHOLE_DOCUMENT: false,
          })
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
