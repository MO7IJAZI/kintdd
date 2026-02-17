'use client';

export default function ArticleStyles() {
  return (
    <style jsx global>{`
      /* Match RichTextEditor styles exactly */
      .blog-content {
          font-size: 1.05rem !important;
          line-height: 1.8 !important;
          color: #334155 !important;
          
          /* STRICT WRAPPING MATCHING EDITOR */
          word-break: keep-all !important; /* Mainly for CJK, acts like normal for others */
          overflow-wrap: break-word !important;
          word-wrap: break-word !important;
          white-space: pre-wrap !important; /* Preserves user spacing */
          hyphens: none !important;
          line-break: strict !important;
          text-align: start !important;
      }

      /* Inherit wrapping rules */
      .blog-content * {
          word-break: inherit !important;
          overflow-wrap: inherit !important;
          white-space: inherit !important;
      }

      /* Tables and technical content protection */
      .blog-content table, 
      .blog-content pre {
          white-space: pre !important;
          word-break: normal !important;
          overflow-x: auto !important;
          display: block !important;
          background-color: #f1f5f9;
          padding: 1rem;
          border-radius: 0.5rem;
      }

      /* Images */
      .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
          display: block;
      }

      /* Lists - Quill editor defaults */
      .blog-content ul, 
      .blog-content ol {
          padding-left: 1.5em;
          margin-bottom: 1em;
      }
      
      .blog-content li {
          margin-bottom: 0.5em;
          padding-left: 0.5em;
      }

      /* Headings within content */
      .blog-content h1, 
      .blog-content h2, 
      .blog-content h3, 
      .blog-content h4 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.3;
      }
      
      .blog-content h2 { font-size: 1.75rem; }
      .blog-content h3 { font-size: 1.5rem; }
      
      /* Links */
      .blog-content a {
          color: #e9496c;
          text-decoration: underline;
          text-underline-offset: 2px;
      }
      
      /* Blockquotes */
      .blog-content blockquote {
          border-left: 4px solid #cbd5e1;
          padding-left: 1rem;
          font-style: italic;
          color: #64748b;
          margin: 1.5rem 0;
      }
    `}</style>
  );
}
