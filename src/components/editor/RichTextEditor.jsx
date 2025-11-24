import { useState } from "react"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin"
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin"

// Import nodes
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { ListNode, ListItemNode } from "@lexical/list"
import { CodeNode, CodeHighlightNode } from "@lexical/code"
import { AutoLinkNode, LinkNode } from "@lexical/link"

// Import transformers
import { TRANSFORMERS } from "@lexical/markdown"

import { cn } from "@/lib/utils"
import ToolbarPlugin from "./ToolbarPlugin"

const editorTheme = {
  paragraph: "mb-1",
  quote: "border-l-4 border-border pl-4 italic text-muted-foreground",
  heading: {
    h1: "text-2xl font-bold mb-2",
    h2: "text-xl font-bold mb-2",
    h3: "text-lg font-bold mb-2",
    h4: "text-base font-bold mb-1",
    h5: "text-sm font-bold mb-1",
    h6: "text-xs font-bold mb-1"
  },
  list: {
    nested: {
      listitem: "list-none"
    },
    ol: "list-decimal list-inside",
    ul: "list-disc list-inside",
    listitem: "mb-1"
  },
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    code: "bg-muted px-1 py-0.5 rounded text-sm font-mono"
  },
  code: "bg-muted p-2 rounded text-sm font-mono block my-2",
  codeHighlight: {
    atrule: "text-purple-600",
    attr: "text-blue-600",
    boolean: "text-red-600",
    builtin: "text-purple-600",
    cdata: "text-gray-600",
    char: "text-green-600",
    class: "text-blue-600",
    "class-name": "text-blue-600",
    comment: "text-gray-600",
    constant: "text-red-600",
    deleted: "text-red-600",
    doctype: "text-gray-600",
    entity: "text-orange-600",
    function: "text-blue-600",
    important: "text-red-600",
    inserted: "text-green-600",
    keyword: "text-purple-600",
    namespace: "text-blue-600",
    number: "text-red-600",
    operator: "text-gray-600",
    prolog: "text-gray-600",
    property: "text-blue-600",
    punctuation: "text-gray-600",
    regex: "text-green-600",
    selector: "text-green-600",
    string: "text-green-600",
    symbol: "text-red-600",
    tag: "text-red-600",
    url: "text-blue-600",
    variable: "text-orange-600"
  },
  link: "text-blue-600 underline hover:text-blue-800",
  // Element format (alignment) styles
  ltr: "text-left",
  rtl: "text-right",
  center: "text-center",
  left: "text-left",
  right: "text-right",
  justify: "text-justify"
}

const RichTextEditor = ({
  initialValue = "",
  onChange,
  placeholder = "Start typing..."
}) => {
  const [floatingAnchorElem, setFloatingAnchorElem] = useState(null)

  const initialConfig = {
    namespace: "NotesEditor",
    theme: editorTheme,
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      AutoLinkNode,
      LinkNode
    ],
    onError: (error) => {
      console.error("Lexical error:", error)
    },
    editorState:
      initialValue && typeof initialValue === "object" && initialValue.root
        ? JSON.stringify(initialValue)
        : null
  }

  const onRef = (_floatingAnchorElem) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem)
    }
  }

  return (
    <div className="border border-border rounded-md overflow-hidden min-h-[70vh]">
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <div className="relative" ref={onRef}>
                <ContentEditable
                  className={cn(
                    "min-h-[200px] p-4 resize-none outline-none",
                    "focus:outline-none",
                    "prose prose-sm max-w-none",
                    "dark:prose-invert"
                  )}
                />
              </div>
            }
            placeholder={
              <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <ListPlugin />
          <LinkPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <OnChangePlugin
            onChange={(editorState) => {
              if (onChange) {
                const editorStateJSON = editorState.toJSON()
                onChange(editorStateJSON)
              }
            }}
          />
        </div>
      </LexicalComposer>
    </div>
  )
}

export default RichTextEditor
