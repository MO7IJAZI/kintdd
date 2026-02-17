'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import './ImageManager.css'

interface ImageData {
  src: string
  alt: string
  title: string
  width?: number
  height?: number
  index: number
}

interface ImageManagerProps {
  contentHtml: string
  onImageUpdate: (updatedHtml: string) => void
}

export default function ImageManager({ contentHtml, onImageUpdate }: ImageManagerProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [editingImage, setEditingImage] = useState<ImageData | null>(null)
  const images = useMemo<ImageData[]>(() => {
    if (typeof DOMParser === 'undefined') return []

    const parser = new DOMParser()
    const doc = parser.parseFromString(contentHtml, 'text/html')
    const imgElements = doc.querySelectorAll('img')

    return Array.from(imgElements).map((img, index) => ({
      src: img.src || '',
      alt: img.alt || '',
      title: img.title || '',
      width: img.width ? parseInt(img.width.toString()) : undefined,
      height: img.height ? parseInt(img.height.toString()) : undefined,
      index,
    }))
  }, [contentHtml])

  const safeSelectedImageIndex =
    selectedImageIndex !== null && selectedImageIndex >= 0 && selectedImageIndex < images.length
      ? selectedImageIndex
      : null

  const selectedImage = safeSelectedImageIndex !== null ? images[safeSelectedImageIndex] : null

  // Update image in HTML
  const updateImageInHTML = (imageIndex: number, newImage: ImageData) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(contentHtml, 'text/html')
    const imgElements = doc.querySelectorAll('img')

    if (imgElements[imageIndex]) {
      const img = imgElements[imageIndex] as HTMLImageElement
      img.src = newImage.src
      img.alt = newImage.alt
      img.title = newImage.title
      if (newImage.width) img.width = newImage.width
      if (newImage.height) img.height = newImage.height

      const serializer = new XMLSerializer()
      const updatedHTML = serializer.serializeToString(doc)
      
      // Extract body content only
      const bodyMatch = updatedHTML.match(/<body[^>]*>([\s\S]*)<\/body>/i)
      const bodyContent = bodyMatch ? bodyMatch[1] : updatedHTML

      onImageUpdate(bodyContent)
    }
  }

  // Delete image from HTML
  const deleteImageFromHTML = (imageIndex: number) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(contentHtml, 'text/html')
    const imgElements = doc.querySelectorAll('img')

    if (imgElements[imageIndex]) {
      imgElements[imageIndex].remove()
      const serializer = new XMLSerializer()
      const updatedHTML = serializer.serializeToString(doc)
      
      const bodyMatch = updatedHTML.match(/<body[^>]*>([\s\S]*)<\/body>/i)
      const bodyContent = bodyMatch ? bodyMatch[1] : updatedHTML

      onImageUpdate(bodyContent)
      setSelectedImageIndex(null)
    }
  }

  // Move image up
  const moveImageUp = (imageIndex: number) => {
    if (imageIndex === 0) return

    const parser = new DOMParser()
    const doc = parser.parseFromString(contentHtml, 'text/html')
    const imgElements = doc.querySelectorAll('img')

    if (imgElements[imageIndex] && imgElements[imageIndex - 1]) {
      const currentImg = imgElements[imageIndex].cloneNode(true)
      const prevImg = imgElements[imageIndex - 1].cloneNode(true)

      imgElements[imageIndex].replaceWith(prevImg)
      imgElements[imageIndex - 1].replaceWith(currentImg)

      const serializer = new XMLSerializer()
      const updatedHTML = serializer.serializeToString(doc)
      
      const bodyMatch = updatedHTML.match(/<body[^>]*>([\s\S]*)<\/body>/i)
      const bodyContent = bodyMatch ? bodyMatch[1] : updatedHTML

      onImageUpdate(bodyContent)
    }
  }

  // Move image down
  const moveImageDown = (imageIndex: number) => {
    if (imageIndex >= images.length - 1) return

    const parser = new DOMParser()
    const doc = parser.parseFromString(contentHtml, 'text/html')
    const imgElements = doc.querySelectorAll('img')

    if (imgElements[imageIndex] && imgElements[imageIndex + 1]) {
      const currentImg = imgElements[imageIndex].cloneNode(true)
      const nextImg = imgElements[imageIndex + 1].cloneNode(true)

      imgElements[imageIndex].replaceWith(nextImg)
      imgElements[imageIndex + 1].replaceWith(currentImg)

      const serializer = new XMLSerializer()
      const updatedHTML = serializer.serializeToString(doc)
      
      const bodyMatch = updatedHTML.match(/<body[^>]*>([\s\S]*)<\/body>/i)
      const bodyContent = bodyMatch ? bodyMatch[1] : updatedHTML

      onImageUpdate(bodyContent)
    }
  }

  return (
    <div className="image-manager">
      <div className="image-manager-header">
        <h3>Image Manager</h3>
        <span className="image-count">{images.length} image(s)</span>
      </div>

      {images.length === 0 ? (
        <div className="image-manager-empty">
          <p>No images in the content yet.</p>
          <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>
            Upload or insert images using the editor toolbar.
          </p>
        </div>
      ) : (
        <div className="image-manager-content">
          {/* Image Gallery */}
          <div className="image-gallery">
            {images.map((image, index) => (
              <div
                key={index}
                className={`image-item ${selectedImageIndex === index ? 'selected' : ''}`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <div className="image-thumbnail">
                  <Image
                    src={image.src}
                    alt={image.alt || 'Image'}
                    fill
                    sizes="120px"
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.opacity = '0.5'
                    }}
                  />
                </div>
                <div className="image-info">
                  <p className="image-alt">{image.alt || '(no alt text)'}</p>
                  <p className="image-index">Image #{index + 1}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Image Editor Panel */}
          {selectedImage && safeSelectedImageIndex !== null && (
            <div className="image-editor-panel">
              <h4>Edit Image #{safeSelectedImageIndex + 1}</h4>
              
              <div className="editor-section">
                <label>URL</label>
                <input
                  type="text"
                  value={editingImage?.src || selectedImage.src}
                  onChange={(e) =>
                    setEditingImage({
                      ...selectedImage,
                      src: e.target.value,
                    })
                  }
                  placeholder="Image URL"
                />
              </div>

              <div className="editor-section">
                <label>Alt Text</label>
                <input
                  type="text"
                  value={editingImage?.alt || selectedImage.alt}
                  onChange={(e) =>
                    setEditingImage({
                      ...selectedImage,
                      alt: e.target.value,
                    })
                  }
                  placeholder="Alt text for accessibility"
                />
              </div>

              <div className="editor-section">
                <label>Title</label>
                <input
                  type="text"
                  value={editingImage?.title || selectedImage.title}
                  onChange={(e) =>
                    setEditingImage({
                      ...selectedImage,
                      title: e.target.value,
                    })
                  }
                  placeholder="Image title"
                />
              </div>

              <div className="editor-row">
                <div className="editor-section">
                  <label>Width (px)</label>
                  <input
                    type="number"
                    value={editingImage?.width || selectedImage.width || ''}
                    onChange={(e) =>
                      setEditingImage({
                        ...selectedImage,
                        width: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="auto"
                    min="0"
                  />
                </div>

                <div className="editor-section">
                  <label>Height (px)</label>
                  <input
                    type="number"
                    value={editingImage?.height || selectedImage.height || ''}
                    onChange={(e) =>
                      setEditingImage({
                        ...selectedImage,
                        height: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="auto"
                    min="0"
                  />
                </div>
              </div>

              <div className="editor-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (editingImage) {
                      updateImageInHTML(safeSelectedImageIndex, editingImage)
                      setEditingImage(null)
                    }
                  }}
                >
                  Save Changes
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditingImage(null)}
                >
                  Cancel
                </button>
              </div>

              <div className="editor-danger-zone">
                <h5>Position & Delete</h5>
                <div className="position-buttons">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => moveImageUp(safeSelectedImageIndex)}
                    disabled={safeSelectedImageIndex === 0}
                    title="Move image up"
                  >
                    ↑ Move Up
                  </button>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => moveImageDown(safeSelectedImageIndex)}
                    disabled={safeSelectedImageIndex >= images.length - 1}
                    title="Move image down"
                  >
                    ↓ Move Down
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteImageFromHTML(safeSelectedImageIndex)}
                    title="Delete image"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
