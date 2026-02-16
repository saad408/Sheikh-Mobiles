import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { ProductColor } from '@/store/cartStore';

const FALLBACK_HEX = '#9CA3AF';
const DARK_HEXES = ['#1a1a1a', '#0d0d0d', '#1f1f1f', '#2c2c2c', '#3d3d3d', '#000', '#1f2937', '#3b4f5c'];

function isDark(hex: string): boolean {
  if (!hex || !hex.startsWith('#')) return false;
  const h = hex.slice(1);
  if (h.length !== 3 && h.length !== 6) return false;
  const r = parseInt(h.length === 3 ? h[0] + h[0] : h.slice(0, 2), 16);
  const g = parseInt(h.length === 3 ? h[1] + h[1] : h.slice(2, 4), 16);
  const b = parseInt(h.length === 3 ? h[2] + h[2] : h.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

interface ColorSelectorProps {
  colors: ProductColor[];
  selected: string | undefined;
  onChange: (colorName: string) => void;
}

export const ColorSelector = ({ colors, selected, onChange }: ColorSelectorProps) => {
  if (!colors?.length) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((color) => {
        const hex = color.hex?.trim() || FALLBACK_HEX;
        const selectedState = selected === color.name;
        const useLightCheck = isDark(hex) || DARK_HEXES.some((d) => hex.toLowerCase().startsWith(d.toLowerCase().slice(0, 4)));

        return (
          <motion.button
            key={color.name}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(color.name)}
            className="flex flex-col items-center gap-2"
            title={color.name}
            aria-label={color.name}
          >
            <div
              className={`relative w-12 h-12 rounded-full border-2 transition-all duration-200 flex items-center justify-center shadow-soft ${
                selectedState ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-border hover:border-muted-foreground'
              }`}
              style={{ backgroundColor: hex }}
            >
              {selectedState && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Check
                    className={`w-5 h-5 ${useLightCheck ? 'text-white' : 'text-primary'}`}
                    strokeWidth={3}
                  />
                </motion.div>
              )}
            </div>
            <span className="text-[10px] font-medium text-muted-foreground text-center max-w-[60px] leading-tight">
              {color.name}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};
