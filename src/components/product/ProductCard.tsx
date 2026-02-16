import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Product } from '@/store/cartStore';
import { getProductImageUrl } from '@/lib/api';
import { Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Link to={`/product/${product.id}`} className="block group">
        <div className="card-product">
          <div className="aspect-square bg-gradient-to-br from-muted to-secondary overflow-hidden p-4">
            <motion.img
              src={getProductImageUrl(product.image)}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div className="p-4">
            <div className="flex items-center gap-1 mb-1.5">
              <Star className="w-3.5 h-3.5 fill-primary text-primary" />
              <span className="text-xs font-medium text-muted-foreground">4.9</span>
            </div>
            <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mb-1">
              {product.category}
            </p>
            <h3 className="font-display text-sm font-semibold leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
            <p className="text-base font-bold">
              ${product.price.toLocaleString()}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
