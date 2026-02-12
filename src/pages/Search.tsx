import { motion } from 'framer-motion';
import { Search as SearchIcon, X, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductsPagination } from '@/components/ui/ProductsPagination';
import { fetchProducts } from '@/api/products';

const SEARCH_DEBOUNCE_MS = 700;
const DEFAULT_LIMIT = 10;
const TRENDING = ['iPhone', 'Samsung', 'Pixel', '5G', 'Pro Max', 'Ultra', 'Camera'];

const Search = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', 'search', debouncedQuery, page],
    queryFn: () =>
      fetchProducts({
        q: debouncedQuery || undefined,
        search: debouncedQuery || undefined,
        page,
        limit: DEFAULT_LIMIT,
      }),
    enabled: debouncedQuery.length > 0,
  });

  const products = data?.data ?? [];
  const pagination = data?.pagination;
  const hasSearchResults = debouncedQuery.length > 0;

  const popularQuery = useQuery({
    queryKey: ['products', 'popular'],
    queryFn: () => fetchProducts({ limit: 4 }),
    enabled: !hasSearchResults,
  });
  const popularProducts = popularQuery.data?.data ?? [];

  return (
    <div className="page-transition">
      <Header title="Search" />

      <div className="container-mobile pt-4 pb-8">
        <div className="relative mb-6">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search phones, brands..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="w-full input-field pl-12 pr-10"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {hasSearchResults ? (
          <>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="card-product aspect-square rounded-2xl bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : isError ? (
              <div className="py-12 text-center">
                <p className="font-medium text-destructive">Something went wrong.</p>
                <p className="text-sm text-muted-foreground mt-1">Please try again later.</p>
              </div>
            ) : products.length > 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-sm text-muted-foreground mb-4 font-medium">
                  {pagination?.summary ?? `${products.length} results for "${debouncedQuery}"`}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
                {pagination && (
                  <ProductsPagination
                    pagination={pagination}
                    onPageChange={(p) => setPage(p)}
                    isLoading={isLoading}
                  />
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <SearchIcon className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">
                  No results found for "{debouncedQuery}"
                </p>
                <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
              </motion.div>
            )}
          </>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-display text-lg font-bold">Trending Searches</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium hover:border-primary hover:text-primary transition-all"
                >
                  {term}
                </button>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="font-display text-lg font-bold mb-4">Popular Right Now</h3>
              {popularQuery.isLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-2xl bg-muted animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {popularProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
};

export default Search;
