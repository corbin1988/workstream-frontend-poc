import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

export default function MarkdownEditor() {
  const [content, setContent] = useState(`# Welcome to Your Documentation

## Getting Started

This is an **Obsidian-like** markdown editor where you can write and see your documentation rendered in real-time.

### Features

- **Live Rendering**: See your markdown converted to formatted text as you type
- **GitHub Flavored Markdown**: Support for tables, task lists, and more
- **Dark Mode Support**: Seamlessly integrates with your theme
- **Inline Editing**: Type markdown and see it render instantly

### Example Content

#### Code Blocks

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

#### Task Lists

- [x] Set up documentation area
- [x] Add markdown support
- [ ] Write your first doc

#### Tables

| Feature | Status |
|---------|--------|
| Markdown | ✅ |
| Preview | ✅ |
| Editing | ✅ |

#### Links & Images

[GitHub](https://github.com)

---

> **Tip:** Start typing to edit inline!
`);

  const contentEditableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus the contenteditable on mount
    if (contentEditableRef.current) {
      contentEditableRef.current.focus();
    }
  }, []);

  const handleInput = (e: ChangeEvent<HTMLDivElement>) => {
    const newContent = e.target.innerText || '';
    setContent(newContent);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-3 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Documentation Editor
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Start typing - markdown renders as you write
          </div>
        </div>
      </div>

      {/* Inline Editor Area */}
      <div className="flex-1 overflow-y-auto bg-gray-800">
        <div
          ref={contentEditableRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onPaste={handlePaste}
          className="min-h-full p-8 focus:outline-none prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-2 prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-10 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-gray-700 prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-8 prose-h4:text-xl prose-h4:mb-2 prose-h4:mt-6 prose-p:mb-4 prose-p:leading-7 prose-p:text-base prose-li:my-1 prose-ul:my-4 prose-ol:my-4 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-[''] prose-pre:bg-gray-50 dark:prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700 prose-pre:rounded-lg prose-pre:my-6 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:my-6 prose-blockquote:not-italic prose-table:border-collapse prose-table:my-6 prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-600 prose-th:bg-gray-50 dark:prose-th:bg-gray-800 prose-th:p-3 prose-th:font-semibold prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-600 prose-td:p-3 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-a:font-medium prose-hr:border-gray-300 dark:prose-hr:border-gray-600 prose-hr:my-8 prose-strong:font-semibold prose-strong:text-gray-900 dark:prose-strong:text-gray-100"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            components={{
              // Custom checkbox rendering for task lists
              input: ({ node, ...props }) => {
                if (props.type === 'checkbox') {
                  return (
                    <input
                      {...props}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mr-2"
                      disabled
                    />
                  );
                }
                return <input {...props} />;
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
