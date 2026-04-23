'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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
    ...customFonts.map(f => `'${f.name}'='${f.name}',sans-serif`),
    'Arial=arial,helvetica,sans-serif',
    'Tahoma=tahoma,arial,helvetica,sans-serif',
    'Georgia=georgia,serif',
    'Times New Roman=times new roman,times,serif',
    'Courier New=courier new,courier,monospace',
  ].join(';')

  return (
    <div className="rich-text-editor-wrapper" dir={dir === 'auto' ? undefined : dir}>
      {/* ── Global style for custom fonts in admin preview ── */}
      {customFontCss && <style dangerouslySetInnerHTML={{ __html: customFontCss }} />}
      
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
          disabled={isUploadingFont}
        />
        <label style={{
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
            accept=".ttf,.otf,.woff,.woff2"
            style={{ display: 'none' }}
            disabled={isUploadingFont}
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const nameInput = document.getElementById('custom-font-name') as HTMLInputElement
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
                console.log('Sending font metadata to API:', postData)
                
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
          paste_merge_formats: true,
          smart_paste: true,
          paste_webkit_styles: 'all',
          paste_retain_style_properties: 'all',
          paste_remove_styles_if_webkit: false,

          /* ─── Pre-process pasted content to ensure styles are preserved ─── */
          paste_preprocess: () => {
            // Keep pasted content styling intact
            // We'll handle overrides in the ExecCommand handler
            // This allows users to paste styled content and then change the font if needed
          },

          /* ─── Post-process pasted content to fix any style issues ─── */
          paste_postprocess: (editor, args) => {
            // Normalize pasted content to be compatible with font changes
            const dom = editor.dom
            const html = args.node
            
            // Find all spans with hardcoded font-family and mark them as overridable
            dom.select('span[style*="font-family"]', html)
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

          // This ensures that when we apply a font, it's applied correctly to the selected content
          // even if it has complex nested structures from copy-paste
          font_size_style_values: '10pt,11pt,12pt,14pt,16pt,18pt,20pt,24pt,28pt,32pt,36pt',
          font_family_formats: fontFamilyFormats,
          
          // CRITICAL: Force font family to wrap with span and not try to optimize by 
          // removing nested spans, which often breaks colors/bold when font is changed
          inline_styles: true,
          schema: 'html5',
          verify_html: false, // Be more lenient with pasted HTML
          convert_fonts_to_spans: true,
          
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
                const selection = editor.selection;
                
                // Use a small timeout to let TinyMCE apply its default formatting first
                setTimeout(() => {
                  editor.undoManager.transact(() => {
                    // If the user selected everything or a large block
                    // we want to ensure ALL nested spans lose their font-family 
                    // so the new font-family (usually applied to a parent span) wins.
                    // BUT we must keep colors, font-size, etc.
                    
                    const walkAndFix = (node: Node) => {
                      if (node.nodeType === 1) { // Element
                        const el = node as HTMLElement;
                        if (el.style.fontFamily) {
                          // Only remove font-family, keep everything else
                          el.style.fontFamily = '';
                          if (!el.getAttribute('style')) el.removeAttribute('style');
                        }
                        el.childNodes.forEach(walkAndFix);
                      }
                    };

                    // Get the actual selection range content to be precise
                    const content = selection.getContent({ format: 'html' });
                    if (content) {
                      // Apply to all elements within the current selection
                      const bookmark = selection.getBookmark();
                      
                      // Find all spans with font-family in the editor and if they are 
                      // within the current selection range, clear their font-family
                      const allSpans = editor.dom.select('span[style*="font-family"]');
                      allSpans.forEach(span => {
                        if (selection.getSel()?.containsNode(span, true)) {
                          span.style.fontFamily = '';
                          if (!span.getAttribute('style')) span.removeAttribute('style');
                        }
                      });
                      
                      selection.moveToBookmark(bookmark);
                    }
                  });
                  editor.nodeChanged();
                }, 10);
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

            /* ── Wrap image left / right (text beside image) ── */
            editor.ui.registry.addButton('wrapImageLeft', {
              icon: 'align-left',
              tooltip: t('wrapLeft'),
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
              tooltip: t('wrapRight'),
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
              tooltip: t('clearWrap'),
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
                  setEditorLoadError(t('replaceError'))
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

            editor.ui.registry.addButton('mediaSize25', { text: '25%', tooltip: t('size25'), onAction: () => setSelectedMediaWidth('25') })
            editor.ui.registry.addButton('mediaSize50', { text: '50%', tooltip: t('size50'), onAction: () => setSelectedMediaWidth('50') })
            editor.ui.registry.addButton('mediaSize75', { text: '75%', tooltip: t('size75'), onAction: () => setSelectedMediaWidth('75') })
            editor.ui.registry.addButton('mediaSize100', { text: '100%', tooltip: t('size100'), onAction: () => setSelectedMediaWidth('100') })
            editor.ui.registry.addButton('mediaSizeAuto', { text: 'Auto', tooltip: t('originalSize'), onAction: () => setSelectedMediaWidth('auto') })

            editor.ui.registry.addMenuItem('kintEditMedia', { text: t('editMedia'), onAction: () => { const node = editor.selection.getNode() as HTMLElement | null; if (!node) return; if (node.tagName === 'IMG') editor.execCommand('mceImage'); else editor.execCommand('mceMedia') } })
            editor.ui.registry.addMenuItem('kintReplaceMedia', { text: t('replaceFile'), onAction: () => { void replaceSelectedMediaSource() } })
            editor.ui.registry.addMenuItem('kintMedia25', { text: t('size25'), onAction: () => setSelectedMediaWidth('25') })
            editor.ui.registry.addMenuItem('kintMedia50', { text: t('size50'), onAction: () => setSelectedMediaWidth('50') })
            editor.ui.registry.addMenuItem('kintMedia75', { text: t('size75'), onAction: () => setSelectedMediaWidth('75') })
            editor.ui.registry.addMenuItem('kintMedia100', { text: t('size100'), onAction: () => setSelectedMediaWidth('100') })
            editor.ui.registry.addMenuItem('kintMediaAuto', { text: t('originalSize'), onAction: () => setSelectedMediaWidth('auto') })
            editor.ui.registry.addMenuItem('kintRemoveNode', { text: t('deleteElement'), onAction: () => { const node = editor.selection.getNode(); if (node) node.remove(); editor.nodeChanged() } })

            editor.ui.registry.addMenuItem('kintTableProps', { text: t('tableProps'), onAction: () => editor.execCommand('mceTableProps') })
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
                return media ? 'kintEditMedia kintReplaceMedia | kintMedia25 kintMedia50 kintMedia75 kintMedia100 kintMediaAuto | kintRemoveNode' : ''
              },
            })
            editor.ui.registry.addContextMenu('kinttable', {
              update: (element) => {
                const table = getClosest(element, 'table')
                return table ? 'kintTableProps | kintTableInsertRowBefore kintTableInsertRowAfter kintTableDeleteRow | kintTableInsertColBefore kintTableInsertColAfter kintTableDeleteCol | kintMergeCells kintSplitCells | kintDeleteTable' : ''
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
            }
            
            /* Ensure custom fonts are available throughout the editor */
            * {
              /* Allow fonts to apply properly */
            }
            
            /* Table styling */
            table {
              border-collapse: collapse;
              width: 100%;
              border: 1px solid #64748b;
            }
            tbody, thead, tfoot, tr, th, td {
              border-color: inherit;
              border-style: inherit;
              border-width: inherit;
            }
            table th, table td {
              padding: 10px 12px;
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
              max-width: 100%;
              height: auto;
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
            
            /* Ensure pasted styled content preserves its appearance */
            span[style*="font-family"] {
              /* Keep pasted font styles intact */
            }
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
              'data-mce-style', 'data-mce-selected', 'data-mce-href', 'data-mce-src'
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
