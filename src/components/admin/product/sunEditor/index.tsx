"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import SunEditor to avoid server-side rendering issues
const SunEditor = dynamic(() => import("suneditor-react"), {
  ssr: false,
});

// Import suneditor CSS
import "suneditor/dist/css/suneditor.min.css";

type SunEditorProps = {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: string;
};

const ProductSunEditor = ({
  value,
  onChange,
  placeholder = "Enter product description...",
  height = "300px",
}: SunEditorProps) => {
  const editorRef = useRef<any>(null);
  const [initialContent, setInitialContent] = useState(value || "");

  // Initialize editor with value on first render
  useEffect(() => {
    setInitialContent(value);
  }, []);

  // Update editor content when value changes from external source
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getContents()) {
      editorRef.current.setContents(value || "");
    }
  }, [value]);

  // Editor configuration
  const options = {
    height,
    buttonList: [
      ["undo", "redo"],
      ["font", "fontSize", "formatBlock"],
      ["paragraphStyle", "blockquote"],
      ["bold", "underline", "italic", "strike", "subscript", "superscript"],
      ["fontColor", "hiliteColor", "textStyle"],
      ["removeFormat"],
      ["outdent", "indent"],
      ["align", "horizontalRule", "list", "lineHeight"],
      ["table", "link", "image"],
      ["fullScreen", "showBlocks", "codeView"],
    ],
    placeholder,
    width: "100%",
  };

  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  return (
    <div className="sun-editor-container">
      <SunEditor
        getSunEditorInstance={(sunEditor) => {
          editorRef.current = sunEditor;
        }}
        setOptions={options}
        onChange={handleEditorChange}
        defaultValue={initialContent}
      />
    </div>
  );
};

export default ProductSunEditor;
