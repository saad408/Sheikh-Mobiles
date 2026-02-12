import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, ShoppingBag, Star, Cpu, Camera, Battery, Smartphone } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { ColorSelector } from '@/components/ui/ColorSelector';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { fetchProductById } from '@/api/products';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

const specs = [
  { icon: Cpu, label: 'Processor', value: 'Latest Gen' },
  { icon: Camera, label: 'Camera', value: 'Pro Grade' },
  { icon: Battery, label: 'Battery', value: 'All-Day' },
  { icon: Smartphone, label: 'Display', value: 'OLED' },
];

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const addItem = useCartStore((state) => state.addItem);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id!),
    enabled: !!id,
  });

  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (product?.colors?.length) setSelectedColor(product.colors[0]);
  }, [product]);

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Invalid product</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page-transition flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-medium text-destructive">Something went wrong.</p>
          <p className="text-sm text-muted-foreground mt-1">Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Product not found</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity, undefined, selectedColor);
    setIsAdded(true);
    toast.success('Added to cart', {
      description: `${product.name} × ${quantity}`,
    });
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="page-transition">
      <Header showBack transparent actions={['share']} />

      {/* Main Content - Side by side on desktop, stacked on mobile */}
      <div className="lg:flex lg:gap-8 lg:px-8 xl:px-16 lg:pt-20 lg:max-w-6xl lg:mx-auto">
        {/* Product Image */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative aspect-square lg:aspect-auto lg:w-1/2 lg:h-[500px] -mt-14 lg:mt-0 bg-gradient-to-br from-muted via-secondary to-muted p-6 lg:p-8 lg:rounded-2xl"
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </motion.div>

        {/* Product Info */}
        <div className="container-mobile lg:w-1/2 lg:max-w-none lg:px-0 pt-6 pb-36 lg:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 gradient-primary text-primary-foreground text-[10px] font-bold rounded-md uppercase">
                {product.category}
              </span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span className="text-sm font-semibold">4.9</span>
                <span className="text-sm text-muted-foreground">(2.4k)</span>
              </div>
            </div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold mb-2">
              {product.name}
            </h1>
            <p className="text-2xl lg:text-3xl font-bold gradient-text mb-4">
              ${product.price.toLocaleString()}
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {product.description}
            </p>
          </motion.div>

          {/* Specs Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-4 lg:grid-cols-2 gap-2 lg:gap-3 mb-6"
          >
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="flex flex-col items-center gap-1.5 p-3 bg-secondary rounded-xl"
              >
                <spec.icon className="w-5 h-5 text-primary" />
                <span className="text-[10px] text-muted-foreground">{spec.label}</span>
                <span className="text-xs font-semibold">{spec.value}</span>
              </div>
            ))}
          </motion.div>

          {/* Color Selection */}
          {product.colors && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <h3 className="font-display font-semibold mb-3">Color</h3>
              <ColorSelector
                colors={product.colors}
                selected={selectedColor}
                onChange={setSelectedColor}
              />
            </motion.div>
          )}

          {/* Quantity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h3 className="font-display font-semibold mb-3">Quantity</h3>
            <QuantitySelector quantity={quantity} onChange={setQuantity} />
          </motion.div>

          {/* Desktop CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="hidden lg:flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/50"
          >
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-bold">
                ${(product.price * quantity).toLocaleString()}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                isAdded
                  ? 'bg-accent text-accent-foreground'
                  : 'gradient-primary text-primary-foreground shadow-glow hover:shadow-elevated'
              }`}
            >
              <AnimatePresence mode="wait">
                {isAdded ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Added!
                  </motion.div>
                ) : (
                  <motion.div
                    key="bag"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-2"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Add to Cart
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Mobile Fixed Bottom CTA */}
      <div className="lg:hidden fixed bottom-20 left-0 right-0 glass-card border-t border-border/50 p-4 z-30">
        <div className="container-mobile flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-xl font-bold">
              ${(product.price * quantity).toLocaleString()}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
              isAdded
                ? 'bg-accent text-accent-foreground'
                : 'gradient-primary text-primary-foreground shadow-glow hover:shadow-elevated'
            }`}
          >
            <AnimatePresence mode="wait">
              {isAdded ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Added!
                </motion.div>
              ) : (
                <motion.div
                  key="bag"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <MobileNav />
    </div>
  );
};

export default ProductDetail;
