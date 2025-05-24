"use client";

import Link from "next/link";

type PaginationProps = {
  page: number;
  totalPages: number;
  baseUrl: string;
};

const Pagination = ({ page, totalPages, baseUrl }: PaginationProps) => {
  // Generate array of page numbers to show
  const getPageNumbers = () => {
    const pages = [];

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    let rangeStart = Math.max(2, page - 1);
    let rangeEnd = Math.min(totalPages - 1, page + 1);

    // Add ellipsis after first page if needed
    if (rangeStart > 2) {
      pages.push("...");
    }

    // Add pages in range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (rangeEnd < totalPages - 1) {
      pages.push("...");
    }

    // Add last page if there's more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center my-8">
      <nav className="inline-flex gap-1 items-center">
        {/* Previous button */}
        {page > 1 ? (
          <Link
            href={`${baseUrl}${page - 1 === 1 ? "" : `?page=${page - 1}`}`}
            className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <span className="sr-only">Previous</span>
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        ) : (
          <span className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-400 bg-white border border-gray-200 rounded-md cursor-not-allowed">
            <span className="sr-only">Previous</span>
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}

        {/* Page numbers */}
        {pageNumbers.map((pageNum, i) => {
          // If the page number is a placeholder (ellipsis)
          if (pageNum === "...") {
            return (
              <span key={`ellipsis-${i}`} className="relative inline-flex items-center px-3 py-2 text-sm text-gray-700">
                ...
              </span>
            );
          }

          // Otherwise render page number
          const isCurrentPage = pageNum === page;
          return (
            <Link
              key={`page-${pageNum}`}
              href={`${baseUrl}${pageNum === 1 ? "" : `?page=${pageNum}`}`}
              className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isCurrentPage
                  ? "z-10 bg-blue-600 text-white border-blue-600"
                  : "text-gray-700 bg-white border-gray-200 hover:bg-gray-50"
              } border`}
              aria-current={isCurrentPage ? "page" : undefined}
            >
              {pageNum}
            </Link>
          );
        })}

        {/* Next button */}
        {page < totalPages ? (
          <Link
            href={`${baseUrl}?page=${page + 1}`}
            className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <span className="sr-only">Next</span>
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        ) : (
          <span className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-400 bg-white border border-gray-200 rounded-md cursor-not-allowed">
            <span className="sr-only">Next</span>
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}
      </nav>
    </div>
  );
};

export default Pagination;
