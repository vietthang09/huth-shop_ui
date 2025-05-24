import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { cn } from "@/shared/utils/styling";

import Button from "../button";

type TProps = {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  routeBase?: string;
};

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange, routeBase }: TProps) => {
  const router = useRouter();

  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Generate pages list with ellipsis
  const pagesList = useMemo(() => {
    const result: (number | null)[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        result.push(i);
      }
    } else {
      // Always show first page
      result.push(1);

      // Show ellipsis or additional pages
      if (currentPage > 3) {
        result.push(null); // ellipsis
      }

      // Calculate start and end of middle section
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust to always show 3 pages in the middle
      if (start === 2) end = 4;
      if (end === totalPages - 1) start = totalPages - 3;

      // Add middle pages
      for (let i = start; i <= end; i++) {
        result.push(i);
      }

      // Show ellipsis or additional pages
      if (currentPage < totalPages - 2) {
        result.push(null); // ellipsis
      }

      // Always show last page
      result.push(totalPages);
    }

    return result;
  }, [currentPage, totalPages]);

  const handlePageClick = (page: number) => {
    if (routeBase) {
      router.push(`${routeBase}${page}`);
    } else {
      onPageChange(page);
    }
  };

  return (
    <div className="flex justify-center mt-4 mb-10 border-t border-gray-200 pt-4 gap-4">
      {pagesList.map((item, idx) =>
        item === null ? (
          <span key={`ellipsis-${idx}`} className="px-2 py-1">
            ...
          </span>
        ) : (
          <Button
            key={`page-${item}-${idx}`}
            onClick={() => handlePageClick(item)}
            disabled={item === currentPage}
            variant={item === currentPage ? "primary" : "secondary"}
            className={cn({
              "opacity-50": item !== currentPage,
            })}
          >
            {item}
          </Button>
        )
      )}
    </div>
  );
};

export default Pagination;
