import { motion } from 'framer-motion';

interface SizeSelectorProps {
  sizes: string[];
  selected: string | undefined;
  onChange: (size: string) => void;
}

export const SizeSelector = ({ sizes, selected, onChange }: SizeSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((size) => (
        <motion.button
          key={size}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(size)}
          className={`relative min-w-[44px] h-11 px-4 rounded-lg border-2 font-medium text-sm transition-all duration-200 ${
            selected === size
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-card hover:border-muted-foreground'
          }`}
        >
          {size}
        </motion.button>
      ))}
    </div>
  );
};
