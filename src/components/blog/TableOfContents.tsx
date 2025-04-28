"use client";

import { useEffect, useState } from "react";

const TableOfContents = ({ html }: { html: string }) => {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);

  useEffect(() => {
    const extractHeadings = () => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const headingElements = doc.querySelectorAll("h1, h2, h3, h4");

      const extractedHeadings = Array.from(headingElements).map((heading, index) => {
        // If heading doesn't have an id, create one
        if (!heading.id) {
          heading.id = `heading-${index}`;
        }

        return {
          id: heading.id,
          text: heading.textContent || "",
          level: parseInt(heading.tagName.charAt(1)),
        };
      });

      setHeadings(extractedHeadings);
    };

    if (typeof window !== "undefined") {
      extractHeadings();
    }
  }, [html]);

  if (headings.length === 0) {
    return <p className="text-gray-500 text-sm">No headings found in this article</p>;
  }

  return (
    <nav>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={`${heading.level === 2 ? "font-medium" : heading.level === 3 ? "pl-4 text-sm" : "pl-6 text-xs"}`}
          >
            <a href={`#${heading.id}`} className="text-gray-700 hover:text-primary truncate block py-1">
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TableOfContents;
