"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css";

// Dynamically import SunEditor to avoid SSR issues
const SunEditor = dynamic(() => import("suneditor-react"), {
  ssr: false,
  loading: () => <div className="border border-gray-300 p-4 min-h-[300px] rounded-md">Loading editor...</div>,
});

// Import the button list and plugins if needed
import SunEditorCore from "suneditor/src/lib/core";
import { buttonList } from "suneditor-react";
import { plugins } from "suneditor/src/plugins";

interface ProductSunEditorProps {
  value: string;
  onChange: (content: string) => void;
}

const ProductSunEditor = ({ value, onChange }: ProductSunEditorProps) => {
  const [mounted, setMounted] = useState(false);

  // Only render the editor client-side to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Editor settings
  const options = {
    height: "300px",
    buttonList: [
      ["undo", "redo"],
      ["font", "fontSize", "formatBlock"],
      ["bold", "underline", "italic", "strike", "subscript", "superscript"],
      ["removeFormat"],
      ["fontColor", "hiliteColor"],
      ["outdent", "indent"],
      ["align", "horizontalRule", "list", "table"],
      ["link", "image", "video"],
      ["fullScreen", "showBlocks", "codeView"],
    ],
    plugins: plugins,
    // Disable auto height to fix iframe height issues
    autoHeight: false,
    // Set a fixed height for the editing area
    height: "300px",
    // Set a default width
    width: "100%",
  };

  // Handle the editor initialization
  const handleEditorLoad = (sunEditor: SunEditorCore) => {
    // Disable auto height function to prevent errors
    if (sunEditor._iframeAutoHeight) {
      sunEditor._iframeAutoHeight = null;
    }
  };

  if (!mounted) {
    return <div className="border border-gray-300 p-4 min-h-[300px] rounded-md">Loading editor...</div>;
  }

  return (
    <div className="suneditor-wrapper">
      <SunEditor setContents={value} onChange={onChange} setOptions={options} onLoad={handleEditorLoad} />
    </div>
  );
};

export default ProductSunEditor;
