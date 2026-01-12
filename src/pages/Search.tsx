import { motion } from 'framer-motion';
import { Search as SearchIcon, X, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { ProductCard } from '@/components/product/ProductCard';
import { products } from '@/data/products';

const Search = () => {
  const [query, setQuery] = useState('');
  
  const filteredProducts = query
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="page-transition">
      <Header title="Search" />

      <div className="container-mobile pt-4 pb-8">
        {/* Search Input */}
        <div className="relative mb-6">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search phones, brands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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

        {/* Results */}
        {query ? (
          filteredProducts.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-sm text-muted-foreground mb-4 font-medium">
                {filteredProducts.length} results for "{query}"
              </p>
              <div className="grid grid-cols-2 gap-4">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
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
              <p className="text-muted-foreground font-medium">No results found for "{query}"</p>
              <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
            </motion.div>
          )
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-display text-lg font-bold">Trending Searches</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {['iPhone', 'Samsung', 'Pixel', '5G', 'Pro Max', 'Ultra', 'Camera'].map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium hover:border-primary hover:text-primary transition-all"
                >
                  {term}
                </button>
              ))}
            </div>

            {/* Popular Products */}
            <div className="mt-8">
              <h3 className="font-display text-lg font-bold mb-4">Popular Right Now</h3>
              <div className="grid grid-cols-2 gap-4">
                {products.slice(0, 4).map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
};

export default Search;
