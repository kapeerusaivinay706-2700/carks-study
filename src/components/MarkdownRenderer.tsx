import React, { useMemo } from "react";
import { marked } from "marked";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
  const htmlContent = useMemo(() => {
    if (!content) return "";
    try {
      marked.setOptions({
        gfm: true,
        breaks: true,
      });
      return marked.parse(content) as string;
    } catch (err) {
      console.error("Markdown parse error:", err);
      return content;
    }
  }, [content]);

  return (
    <div
      className={`markdown-academic text-stone-800 leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};
