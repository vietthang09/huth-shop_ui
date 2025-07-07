"use client";

type ClientPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const ClientPagination = ({ page, totalPages, onPageChange }: ClientPaginationProps) => {
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
    <nav className="flex items-center justify-center space-x-1">
      {/* Previous button */}
      <button
        onClick={() => page > 1 && onPageChange(page - 1)}
        disabled={page <= 1}
        className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
          page <= 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        }`}
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
      </button>

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

        const pageNumber = pageNum as number;
        const isCurrentPage = pageNumber === page;

        return (
          <button
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isCurrentPage
                ? "z-10 bg-blue-600 text-white focus:z-20"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {pageNumber}
          </button>
        );
      })}

      {/* Next button */}
      <button
        onClick={() => page < totalPages && onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
          page >= totalPages ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        }`}
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
      </button>
    </nav>
  );
};

export default ClientPagination;
