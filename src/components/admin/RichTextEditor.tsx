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

  const uploadAsset = useCallback(async (file: Blob, fileName = 'upload-file') => {
    const formData = new FormData()
    formData.append('file', file, fileName)
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) {
      throw new Error('Upload failed')
    }
    const data = await response.json() as { url?: string }
    if (!data?.url) {
      throw new Error('Invalid upload response')
    }
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
    return () => {
      autosave.cancel()
    }
  }, [autosave])

  const updateStats = (html: string) => {
    const plain = html
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    const words = plain ? plain.split(' ').length : 0
    const chars = plain.length
    const lines = Math.max(1, html.split(/\n|<br\s*\/?>/i).length)
    setStats({ words, chars, lines })
  }

  return (
    <div className="rich-text-editor-wrapper" dir={dir === 'auto' ? undefined : dir}>
      {label && (
        <label className="editor-label">
          {label}
        </label>
      )}
      <TinyMCEEditor
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
            'media', 'table', 'wordcount'
          ],
          automatic_uploads: true,
          images_file_types: 'jpg,jpeg,png,gif,webp,svg',
          file_picker_types: 'image media',
          toolbar: 'undo redo | fontfamily fontsize blocks | bold italic underline strikethrough forecolor backcolor | alignleft aligncenter alignright alignjustify | ltr rtl | bullist numlist outdent indent | uploadImage uploadVideo mediaSize25 mediaSize50 mediaSize75 mediaSize100 mediaSizeAuto | link image media emoticons charmap pagebreak nonbreaking | table tableprops tabledelete tableinsertrowbefore tableinsertrowafter tabledeleterow tableinsertcolbefore tableinsertcolafter tabledeletecol | codeTools codesample code visualblocks visualchars fullscreen preview | removeformat',
          quickbars_selection_toolbar: 'bold italic underline | forecolor backcolor | blocks | link | codesample',
          quickbars_insert_toolbar: 'quickimage quicktable pagebreak',
          contextmenu: 'kintmedia kinttable kintlink kinttext',
          quickbars_image_toolbar: 'alignleft aligncenter alignright | imageoptions',
          style_formats: [
            { title: 'Paragraph', block: 'p' },
            { title: 'Heading 1', block: 'h1' },
            { title: 'Heading 2', block: 'h2' },
            { title: 'Heading 3', block: 'h3' },
            { title: 'Heading 4', block: 'h4' },
            { title: 'Blockquote', block: 'blockquote' },
            { title: 'Code Block', block: 'pre', classes: 'language-markup' },
          ],
          font_family_formats: 'Inter=Inter,sans-serif;Arial=arial,helvetica,sans-serif;Tahoma=tahoma,arial,helvetica,sans-serif;Times New Roman=times new roman,times,serif;Courier New=courier new,courier,monospace;',
          fontsize_formats: '10pt 11pt 12pt 14pt 16pt 18pt 20pt 24pt 28pt 32pt 36pt',
          line_height_formats: '1 1.15 1.5 1.75 2 2.5 3',
          autosave_ask_before_unload: false,
          autosave_restore_when_empty: true,
          browser_spellcheck: true,
          object_resizing: true,
          resize_img_proportional: true,
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
            const getClosest = (element: Element | null, selector: string) => element?.closest(selector) as HTMLElement | null
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
                  if (tag === 'IMG') {
                    node.setAttribute('src', url)
                    node.setAttribute('alt', file.name)
                  } else if (tag === 'VIDEO') {
                    node.setAttribute('src', url)
                  } else {
                    node.setAttribute('src', url)
                  }
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
            editor.ui.registry.addMenuItem('kintEditMedia', {
              text: 'تحرير الوسائط',
              onAction: () => {
                const node = editor.selection.getNode() as HTMLElement | null
                if (!node) return
                const tag = node.tagName
                if (tag === 'IMG') {
                  editor.execCommand('mceImage')
                } else {
                  editor.execCommand('mceMedia')
                }
              },
            })
            editor.ui.registry.addMenuItem('kintReplaceMedia', {
              text: 'استبدال الملف',
              onAction: () => { void replaceSelectedMediaSource() },
            })
            editor.ui.registry.addMenuItem('kintMedia25', { text: 'حجم 25%', onAction: () => setSelectedMediaWidth('25') })
            editor.ui.registry.addMenuItem('kintMedia50', { text: 'حجم 50%', onAction: () => setSelectedMediaWidth('50') })
            editor.ui.registry.addMenuItem('kintMedia75', { text: 'حجم 75%', onAction: () => setSelectedMediaWidth('75') })
            editor.ui.registry.addMenuItem('kintMedia100', { text: 'حجم 100%', onAction: () => setSelectedMediaWidth('100') })
            editor.ui.registry.addMenuItem('kintMediaAuto', { text: 'الحجم الأصلي', onAction: () => setSelectedMediaWidth('auto') })
            editor.ui.registry.addMenuItem('kintRemoveNode', {
              text: 'حذف العنصر',
              onAction: () => {
                const node = editor.selection.getNode()
                if (node) node.remove()
                editor.nodeChanged()
              },
            })
            editor.ui.registry.addMenuItem('kintTableProps', { text: 'خصائص الجدول', onAction: () => editor.execCommand('mceTableProps') })
            editor.ui.registry.addMenuItem('kintTableInsertRowBefore', { text: 'إدراج صف قبل', onAction: () => editor.execCommand('mceTableInsertRowBefore') })
            editor.ui.registry.addMenuItem('kintTableInsertRowAfter', { text: 'إدراج صف بعد', onAction: () => editor.execCommand('mceTableInsertRowAfter') })
            editor.ui.registry.addMenuItem('kintTableDeleteRow', { text: 'حذف الصف', onAction: () => editor.execCommand('mceTableDeleteRow') })
            editor.ui.registry.addMenuItem('kintTableInsertColBefore', { text: 'إدراج عمود قبل', onAction: () => editor.execCommand('mceTableInsertColBefore') })
            editor.ui.registry.addMenuItem('kintTableInsertColAfter', { text: 'إدراج عمود بعد', onAction: () => editor.execCommand('mceTableInsertColAfter') })
            editor.ui.registry.addMenuItem('kintTableDeleteCol', { text: 'حذف العمود', onAction: () => editor.execCommand('mceTableDeleteCol') })
            editor.ui.registry.addMenuItem('kintTableDelete', { text: 'حذف الجدول', onAction: () => editor.execCommand('mceTableDelete') })
            editor.ui.registry.addMenuItem('kintEditLink', { text: 'تحرير الرابط', onAction: () => editor.execCommand('mceLink') })
            editor.ui.registry.addMenuItem('kintUnlink', { text: 'إزالة الرابط', onAction: () => editor.execCommand('unlink') })
            editor.ui.registry.addMenuItem('kintCopyLink', {
              text: 'نسخ الرابط',
              onAction: async () => {
                const node = editor.selection.getNode() as HTMLElement | null
                const anchor = getClosest(node, 'a')
                const href = anchor?.getAttribute('href')
                if (!href) return
                try {
                  await navigator.clipboard.writeText(href)
                } catch {}
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
                return table ? 'kintTableProps | kintTableInsertRowBefore kintTableInsertRowAfter kintTableDeleteRow | kintTableInsertColBefore kintTableInsertColAfter kintTableDeleteCol | kintTableDelete' : ''
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
                    editor.insertContent(`<img src="${url}" alt="${file.name}" />`)
                  } catch {
                    setEditorLoadError('فشل رفع الصورة')
                  }
                }
                input.click()
              },
            })
            editor.ui.registry.addButton('uploadVideo', {
              icon: 'embed',
              tooltip: 'رفع فيديو',
              onAction: () => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'video/*'
                input.onchange = async () => {
                  const file = input.files?.[0]
                  if (!file) return
                  try {
                    const url = await uploadAsset(file, file.name)
                    editor.insertContent(`<video controls src="${url}" style="max-width: 100%;"></video>`)
                  } catch {
                    setEditorLoadError('فشل رفع الفيديو')
                  }
                }
                input.click()
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
            const url = await uploadAsset(blobInfo.blob(), blobInfo.filename())
            return url
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
                if (meta.filetype === 'image') {
                  callback(url, { alt: file.name })
                } else {
                  callback(url)
                }
              } catch {
                setEditorLoadError('فشل رفع الملف')
              }
            }
            input.click()
          },
          table_use_colgroups: true,
          table_resize_bars: true,
          table_default_attributes: {
            border: '1',
          },
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
          content_style: `
            body { font-family: Inter, system-ui, sans-serif; font-size: 16px; line-height: 1.7; color: #334155; padding: 14px; direction: ${dir === 'rtl' ? 'rtl' : 'ltr'}; }
            table { border-collapse: collapse; width: 100%; border: 1px solid #64748b; }
            table th, table td { border: 1px solid #64748b; padding: 10px 12px; }
            table th { background: #f8fafc; font-weight: 700; }
            pre[class*="language-"] { background: #0f172a; color: #e2e8f0; padding: 14px; border-radius: 10px; overflow-x: auto; }
            code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace; }
            img, video, iframe { max-width: 100%; }
            img[data-mce-selected], video[data-mce-selected], iframe[data-mce-selected] { outline: 2px solid #3b82f6; outline-offset: 2px; }
          `,
        }}
        onEditorChange={(html) => {
          const clean = DOMPurify.sanitize(html, {
            ADD_TAGS: ['video', 'source', 'iframe', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'colgroup', 'col'],
            ADD_ATTR: ['controls', 'width', 'height', 'src', 'allow', 'allowfullscreen', 'frameborder', 'data-type', 'type', 'style', 'colspan', 'rowspan', 'data-float', 'data-border-color', 'data-border-width', 'border', 'cellpadding', 'cellspacing', 'class', 'id', 'dir', 'lang'],
          })
          if (!onChange) setLocalContent(clean)
          updateStats(clean)
          autosave(clean)
          onChange?.(clean)
        }}
      />
      {editorLoadError && (
        <div className="editor-info" style={{ color: '#b91c1c' }}>
          {editorLoadError}
        </div>
      )}
      <div className="editor-info">
        💡 {t('tip')}
      </div>
      <div className="editor-statusbar">
        <span>{`Words: ${stats.words}`}</span>
        <span>{`Chars: ${stats.chars}`}</span>
        <span>{`Lines: ${stats.lines}`}</span>
      </div>
    </div>
  )
}
