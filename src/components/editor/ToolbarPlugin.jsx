import React, { useCallback, useEffect, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { mergeRegister } from "@lexical/utils"
import {
  $getSelection,
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  FORMAT_ELEMENT_COMMAND
} from "lexical"
import { $setBlocksType } from "@lexical/selection"
import { $findMatchingParent, $getNearestNodeOfType } from "@lexical/utils"
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode
} from "@lexical/rich-text"
import { $createParagraphNode, $isRootOrShadowRoot } from "lexical"
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode
} from "@lexical/list"

import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Bold,
  Italic,
  Underline,
  Undo2,
  Redo2,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from "lucide-react"

const blockTypeToBlockName = {
  paragraph: "Normal",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  h5: "Heading 5",
  h6: "Heading 6",
  quote: "Quote",
  bullet: "Bulleted List",
  number: "Numbered List"
}

const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext()

  // Format states
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)

  // History states
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  // Block type state
  const [blockType, setBlockType] = useState("paragraph")

  // Alignment state
  const [elementFormat, setElementFormat] = useState("left")

  // Font state

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      // Update format states
      setIsBold(selection.hasFormat("bold"))
      setIsItalic(selection.hasFormat("italic"))
      setIsUnderline(selection.hasFormat("underline"))

      // Update block type
      const anchorNode = selection.anchor.getNode()
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent()
              return parent !== null && $isRootOrShadowRoot(parent)
            })

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow()
      }

      const elementDOM = editor.getElementByKey(element.getKey())

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode)
          const type = parentList
            ? parentList.getListType()
            : element.getListType()
          setBlockType(type)
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType()
          if (type in blockTypeToBlockName) {
            setBlockType(type)
          }
        }

        // Update element format (alignment)
        const elementFormat = element.getFormatType()
        setElementFormat(elementFormat || "left")
      }
    }
  }, [editor])

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateToolbar()
          return false
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar()
        })
      }),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload)
          return false
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload)
          return false
        },
        COMMAND_PRIORITY_CRITICAL
      )
    )
  }, [editor, $updateToolbar])

  const formatHeading = (headingLevel) => {
    editor.update(() => {
      const selection = $getSelection()
      $setBlocksType(selection, () => $createHeadingNode(headingLevel))
    })
  }

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection()
      $setBlocksType(selection, () => $createParagraphNode())
    })
  }

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection()
      $setBlocksType(selection, () => $createQuoteNode())
    })
  }

  const formatOrderedList = () => {
    if (blockType !== "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    }
  }

  const formatUnorderedList = () => {
    if (blockType !== "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    }
  }

  const handleBlockTypeChange = (value) => {
    switch (value) {
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
        formatHeading(value)
        break
      case "paragraph":
        formatParagraph()
        break
      case "quote":
        formatQuote()
        break
      case "number":
        formatOrderedList()
        break
      case "bullet":
        formatUnorderedList()
        break
    }
  }

  const formatAlignment = (alignment) => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment)
  }

  return (
    <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30">
      {/* History Controls */}
      <Button
        variant="ghost"
        size="sm"
        disabled={!canUndo}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        className="h-8 w-8 p-0"
      >
        <Undo2 className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        disabled={!canRedo}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        className="h-8 w-8 p-0"
      >
        <Redo2 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Block Type Selector */}
      <Select value={blockType} onValueChange={handleBlockTypeChange}>
        <SelectTrigger className="w-32 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(blockTypeToBlockName).map(([key, name]) => (
            <SelectItem key={key} value={key}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Text Formatting */}
      <Toggle
        pressed={isBold}
        onPressedChange={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")
        }
        size="sm"
        className="h-8 w-8 p-0"
      >
        <Bold className="h-4 w-4" />
      </Toggle>

      <Toggle
        pressed={isItalic}
        onPressedChange={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")
        }
        size="sm"
        className="h-8 w-8 p-0"
      >
        <Italic className="h-4 w-4" />
      </Toggle>

      <Toggle
        pressed={isUnderline}
        onPressedChange={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")
        }
        size="sm"
        className="h-8 w-8 p-0"
      >
        <Underline className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Text Alignment */}
      <Toggle
        pressed={elementFormat === "left"}
        onPressedChange={() => formatAlignment("left")}
        size="sm"
        className="h-8 w-8 p-0"
      >
        <AlignLeft className="h-4 w-4" />
      </Toggle>

      <Toggle
        pressed={elementFormat === "center"}
        onPressedChange={() => formatAlignment("center")}
        size="sm"
        className="h-8 w-8 p-0"
      >
        <AlignCenter className="h-4 w-4" />
      </Toggle>

      <Toggle
        pressed={elementFormat === "right"}
        onPressedChange={() => formatAlignment("right")}
        size="sm"
        className="h-8 w-8 p-0"
      >
        <AlignRight className="h-4 w-4" />
      </Toggle>

      <Toggle
        pressed={elementFormat === "justify"}
        onPressedChange={() => formatAlignment("justify")}
        size="sm"
        className="h-8 w-8 p-0"
      >
        <AlignJustify className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* List Controls */}
      <Button
        variant="ghost"
        size="sm"
        onClick={formatUnorderedList}
        className="h-8 w-8 p-0"
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={formatOrderedList}
        className="h-8 w-8 p-0"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={formatQuote}
        className="h-8 w-8 p-0"
      >
        <Quote className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default ToolbarPlugin
