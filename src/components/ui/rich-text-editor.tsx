"use client";

import React from "react";
import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css";
import { uploadFile } from "@/services/cloud";
import { toast } from "sonner";
import type SunEditorCore from "suneditor/src/lib/core";

const SunEditor = dynamic(() => import("suneditor-react"), {
  ssr: false,
  loading: () => (
    <div className="border rounded-md p-4 min-h-[200px] bg-gray-50 animate-pulse flex items-center justify-center">
      <span className="text-gray-400">Đang tải trình soạn thảo...</span>
    </div>
  ),
});

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  height?: string;
  className?: string;
}

const buttonList = [
  ["undo", "redo"],
  ["font", "fontSize", "formatBlock"],
  ["bold", "underline", "italic", "strike"],
  ["fontColor", "hiliteColor"],
  ["removeFormat"],
  ["outdent", "indent"],
  ["align", "horizontalRule", "list", "table"],
  ["link", "image"],
  ["fullScreen", "showBlocks", "codeView"],
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  disabled = false,
  height = "300px",
  className = "",
}) => {
  const editorRef = React.useRef<SunEditorCore>();

  const handleChange = (content: string) => {
    // SunEditor returns <p><br></p> for empty content, treat it as empty string
    const cleanContent = content === "<p><br></p>" || content === "<p></p>" ? "" : content;
    onChange(cleanContent);
  };

  const getSunEditorInstance = (sunEditor: SunEditorCore) => {
    editorRef.current = sunEditor;
  };

  const handleImageUploadBefore = (
    files: File[],
    _info: object,
    uploadHandler: (result: { result: { url: string; name: string; size: number }[] } | null) => void
  ) => {
    const file = files[0];

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Chỉ hỗ trợ định dạng JPG, PNG, WEBP, GIF");
      uploadHandler(null);
      return false;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      uploadHandler(null);
      return false;
    }

    // Upload to cloud
    uploadFile(file)
      .then((response) => {
        const imageUrl = response.data.url;
        uploadHandler({
          result: [
            {
              url: imageUrl,
              name: file.name,
              size: file.size,
            },
          ],
        });
        toast.success("Tải ảnh lên thành công");
      })
      .catch((error) => {
        console.error("Image upload error:", error);
        toast.error("Có lỗi xảy ra khi tải ảnh lên");
        uploadHandler(null);
      });

    // Return false to handle upload manually
    return false;
  };

  return (
    <div className={`rich-text-editor ${className}`}>
      <SunEditor
        getSunEditorInstance={getSunEditorInstance}
        setContents={value}
        onChange={handleChange}
        onImageUploadBefore={handleImageUploadBefore}
        placeholder={placeholder}
        disable={disabled}
        height={height}
        setOptions={{
          buttonList: buttonList,
          defaultTag: "p",
          minHeight: "200px",
          showPathLabel: false,
          font: [
            "Arial",
            "Comic Sans MS",
            "Courier New",
            "Impact",
            "Georgia",
            "Tahoma",
            "Trebuchet MS",
            "Verdana",
            "Roboto",
          ],
          fontSize: [8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72],
          formats: ["p", "blockquote", "h1", "h2", "h3", "h4", "h5", "h6"],
          colorList: [
            "#000000",
            "#e60000",
            "#ff9900",
            "#ffff00",
            "#008a00",
            "#0066cc",
            "#9933ff",
            "#ffffff",
            "#facccc",
            "#ffebcc",
            "#ffffcc",
            "#cce8cc",
            "#cce0f5",
            "#ebd6ff",
            "#bbbbbb",
            "#f06666",
            "#ffc266",
            "#ffff66",
            "#66b966",
            "#66a3e0",
            "#c285ff",
            "#888888",
            "#a10000",
            "#b26b00",
            "#b2b200",
            "#006100",
            "#0047b2",
            "#6b24b2",
            "#444444",
            "#5c0000",
            "#663d00",
            "#666600",
            "#003700",
            "#002966",
            "#3d1466",
          ],
        }}
      />
      <style jsx global>{`
        .rich-text-editor .sun-editor {
          border-radius: 0.375rem;
          border-color: #d1d5db;
        }
        .rich-text-editor .sun-editor .se-toolbar {
          border-radius: 0.375rem 0.375rem 0 0;
          background-color: #f9fafb;
        }
        .rich-text-editor .sun-editor .se-wrapper {
          border-radius: 0 0 0.375rem 0.375rem;
        }
        .rich-text-editor .sun-editor .se-wrapper .se-wrapper-inner {
          min-height: 200px;
        }
        .rich-text-editor .sun-editor-editable {
          font-family: inherit;
          font-size: 14px;
          line-height: 1.5;
        }
        .rich-text-editor .sun-editor.se-disabled {
          background-color: #f3f4f6;
        }
        .rich-text-editor .sun-editor.se-disabled .se-wrapper {
          background-color: #f3f4f6;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
