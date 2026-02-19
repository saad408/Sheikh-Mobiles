import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationMeta } from '@/api/products';

interface ProductsPaginationProps {
  pagination: PaginationMeta | undefined;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function ProductsPagination({ pagination, onPageChange, isLoading }: ProductsPaginationProps) {
  if (!pagination) return null;
  const { page, totalPages, hasPrev, hasNext, summary } = pagination;
  if (totalPages <= 1) {
    return (
      <p className="text-sm text-muted-foreground font-medium mt-4 text-center">
        {summary}
      </p>
    );
  }

  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 flex flex-col items-center gap-4"
    >
      <p className="text-sm text-muted-foreground font-medium">{summary}</p>
      <nav
        role="navigation"
        aria-label="pagination"
        className="flex items-center gap-2"
      >
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => onPageChange(prevPage)}
          disabled={!hasPrev || isLoading}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-secondary text-secondary-foreground border border-border hover:bg-muted disabled:opacity-50 disabled:pointer-events-none transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </motion.button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <motion.button
              key={p}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => onPageChange(p)}
              disabled={isLoading}
              className={`min-w-[2.25rem] h-9 px-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                p === page
                  ? 'gradient-primary text-primary-foreground shadow-glow'
                  : 'bg-secondary text-secondary-foreground hover:bg-muted'
              } disabled:opacity-50 disabled:pointer-events-none`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </motion.button>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => onPageChange(nextPage)}
          disabled={!hasNext || isLoading}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-secondary text-secondary-foreground border border-border hover:bg-muted disabled:opacity-50 disabled:pointer-events-none transition-all"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </nav>
    </motion.div>
  );
}
