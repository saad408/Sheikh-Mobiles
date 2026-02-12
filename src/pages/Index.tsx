import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, Shield, Truck, Search as SearchIcon, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { MobileNav } from '@/components/layout/MobileNav';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductsPagination } from '@/components/ui/ProductsPagination';
import { fetchProducts } from '@/api/products';
import { useState, useEffect } from 'react';

const CATEGORIES = ['All', 'Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Nothing'];
const DEFAULT_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 700;

const features = [
  { icon: Zap, label: 'Fast Delivery' },
  { icon: Shield, label: 'Warranty' },
  { icon: Truck, label: 'Free Shipping' },
];

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [searchBarOpen, setSearchBarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const isSearchMode = searchBarOpen && debouncedSearch.length > 0;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', selectedCategory, page],
    queryFn: () =>
      fetchProducts({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        page,
        limit: DEFAULT_LIMIT,
      }),
    enabled: !isSearchMode,
  });

  const searchQueryResult = useQuery({
    queryKey: ['products', 'search', debouncedSearch, page],
    queryFn: () =>
      fetchProducts({
        q: debouncedSearch,
        search: debouncedSearch,
        page,
        limit: DEFAULT_LIMIT,
      }),
    enabled: isSearchMode,
  });

  const products = isSearchMode ? (searchQueryResult.data?.data ?? []) : (data?.data ?? []);
  const pagination = isSearchMode ? searchQueryResult.data?.pagination : data?.pagination;
  const isLoadingProducts = isSearchMode ? searchQueryResult.isLoading : isLoading;
  const isErrorProducts = isSearchMode ? searchQueryResult.isError : isError;

  return (
    <div className="page-transition">
      {/* Hero Section */}
      <section className="relative h-[50vh] sm:h-[55vh] md:h-[60vh] lg:h-[65vh] overflow-hidden">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          src="/products/iPh.jpeg"
          alt="Black iPhone"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />

        <div className="absolute inset-0 flex items-center">
          <div className="container-mobile w-full px-4 md:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative z-10 max-w-md"
            >
              <p className="text-white font-semibold text-sm uppercase tracking-wider mb-3 drop-shadow-lg">
                New Arrivals 2024
              </p>
              <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4 text-white drop-shadow-lg">
                Find Your<br />
                <span className="text-white">Perfect Phone</span>
              </h1>
              <p className="text-white/95 text-sm md:text-base mb-6 max-w-[320px] leading-relaxed drop-shadow-md">
                Discover the latest flagship smartphones from top brands at unbeatable prices.
              </p>
              <button
                type="button"
                onClick={() =>
                  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="btn-accent inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
              >
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Badges */}
      <section className="container-mobile py-5">
        <div className="flex justify-between gap-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex-1 flex flex-col items-center gap-2 py-3 px-2 bg-card rounded-xl border border-border/50"
            >
              <feature.icon className="w-5 h-5 text-primary" />
              <span className="text-[10px] font-medium text-muted-foreground">{feature.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-mobile py-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {CATEGORIES.map((category) => (
            <motion.button
              key={category}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedCategory(category);
                setPage(1);
              }}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                selectedCategory === category
                  ? 'gradient-primary text-primary-foreground shadow-glow'
                  : 'bg-secondary text-secondary-foreground hover:bg-muted'
              }`}
            >
              {category}
            </motion.button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" className="px-4 lg:px-8 xl:px-16 max-w-7xl mx-auto pb-8 scroll-mt-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-display text-xl font-bold shrink-0">
            {selectedCategory === 'All' ? 'All Phones' : selectedCategory}
          </h2>
          <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
            <AnimatePresence mode="wait">
              {searchBarOpen ? (
                <motion.div
                  key="input"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative flex items-center min-w-[120px] max-w-[180px] sm:max-w-[220px]"
                >
                  <SearchIcon className="absolute left-2.5 w-4 h-4 text-muted-foreground pointer-events-none shrink-0" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="h-9 w-full rounded-xl border border-border bg-card pl-8 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchBarOpen(false);
                      setSearchQuery('');
                      setPage(1);
                    }}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted text-muted-foreground"
                    aria-label="Close search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="btn"
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchBarOpen(true)}
                  className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-secondary transition-colors shrink-0"
                  aria-label="Search"
                >
                  <SearchIcon className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>
            {pagination && (
              <span className="text-sm text-muted-foreground font-medium shrink-0">
                {isSearchMode ? `${pagination.total} results` : `${pagination.total} devices`}
              </span>
            )}
          </div>
        </div>

        {isLoadingProducts ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="card-product aspect-square rounded-2xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : isErrorProducts ? (
          <div className="py-12 text-center">
            <p className="text-destructive font-medium">Something went wrong.</p>
            <p className="text-sm text-muted-foreground mt-1">Please try again later.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            {isSearchMode ? `No results for "${debouncedSearch}"` : 'No phones in this category.'}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
            {pagination && (
              <ProductsPagination
                pagination={pagination}
                onPageChange={setPage}
                isLoading={isLoadingProducts}
              />
            )}
          </>
        )}
      </section>

      <MobileNav />
    </div>
  );
};

export default Index;
