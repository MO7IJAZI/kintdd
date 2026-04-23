'use client'

import { useEffect, useState } from 'react'

export default function CustomFontsLoader() {
  const [css, setCss] = useState('')

  useEffect(() => {
    fetch('/api/fonts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const fontFaceCss = data.map(f =>
            `@font-face { font-family: '${f.name}'; src: url('${f.url}'); font-display: swap; }`
          ).join('\n')
          setCss(fontFaceCss)
        }
      })
      .catch(console.error)
  }, [])

  if (!css) return null

  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
