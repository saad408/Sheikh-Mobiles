import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  transparent?: boolean;
  actions?: ('heart' | 'share')[];
}

export const Header = ({ title, showBack = false, transparent = false, actions = [] }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`sticky top-0 z-40 ${
        transparent ? 'bg-transparent' : 'bg-background/80 backdrop-blur-xl border-b border-border'
      }`}
    >
      <div className="container-mobile flex items-center justify-between h-14">
        <div className="w-10">
          {showBack && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          )}
        </div>
        
        {title && (
          <h1 className="font-serif text-lg font-medium">{title}</h1>
        )}
        
        <div className="w-10 flex justify-end gap-1">
          {actions.includes('heart') && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <Heart className="w-5 h-5" />
            </motion.button>
          )}
          {actions.includes('share') && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.header>
  );
};
