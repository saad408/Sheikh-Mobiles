import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Truck } from 'lucide-react';
import { MobileNav } from '@/components/layout/MobileNav';
import { ProductCard } from '@/components/product/ProductCard';
import { products, categories } from '@/data/products';
import { useState } from 'react';

const features = [
  { icon: Zap, label: 'Fast Delivery' },
  { icon: Shield, label: 'Warranty' },
  { icon: Truck, label: 'Free Shipping' },
];

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

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
        {/* Subtle gradient overlay for better text contrast */}
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
              <Link to="/product/1" className="btn-accent inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow">
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </Link>
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
          {categories.map((category) => (
            <motion.button
              key={category}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category)}
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
      <section className="px-4 lg:px-8 xl:px-16 max-w-7xl mx-auto pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold">
            {selectedCategory === 'All' ? 'All Phones' : selectedCategory}
          </h2>
          <span className="text-sm text-muted-foreground font-medium">
            {filteredProducts.length} devices
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="container-mobile pb-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl p-6"
          style={{ background: 'var(--gradient-hero)' }}
        >
          <div className="relative z-10 text-primary-foreground">
            <p className="text-xs uppercase tracking-wider opacity-80 mb-1">
              Limited Time Offer
            </p>
            <h3 className="font-display text-xl font-bold mb-2">
              Trade-In & Save
            </h3>
            <p className="text-sm opacity-90 mb-4">
              Get up to $500 off when you trade in your old device.
            </p>
            <Link 
              to="/product/2"
              className="inline-flex items-center gap-2 text-sm font-semibold bg-primary-foreground/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-primary-foreground/30 transition-colors"
            >
              Learn More
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary-foreground/10 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-primary-foreground/10 translate-y-1/2 -translate-x-1/2" />
        </motion.div>
      </section>

      <MobileNav />
    </div>
  );
};

export default Index;
