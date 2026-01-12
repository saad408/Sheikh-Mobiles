import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ColorSelectorProps {
  colors: string[];
  selected: string | undefined;
  onChange: (color: string) => void;
}

const colorMap: Record<string, string> = {
  // iPhone colors
  'Natural Titanium': '#A8A8A8',
  'Blue Titanium': '#3B4F5C',
  'White Titanium': '#E5E4DF',
  'Black Titanium': '#2C2C2C',
  // Samsung colors
  'Titanium Black': '#1A1A1A',
  'Titanium Gray': '#6B6B6B',
  'Titanium Violet': '#8B7AA8',
  'Titanium Yellow': '#D4C088',
  // Pixel colors
  'Bay': '#5E9EBF',
  'Obsidian': '#1F1F1F',
  'Porcelain': '#E8E5E1',
  // OnePlus colors
  'Flowy Emerald': '#2E8B6D',
  'Silky Black': '#0D0D0D',
  // Xiaomi colors
  'White': '#FAFAFA',
  'Black': '#1A1A1A',
  // Nothing colors
  'Dark Grey': '#3D3D3D',
};

export const ColorSelector = ({ colors, selected, onChange }: ColorSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((color) => (
        <motion.button
          key={color}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(color)}
          className="flex flex-col items-center gap-2"
        >
          <div
            className={`relative w-12 h-12 rounded-full border-2 transition-all duration-200 flex items-center justify-center shadow-soft ${
              selected === color ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-border hover:border-muted-foreground'
            }`}
            style={{ backgroundColor: colorMap[color] || '#888' }}
          >
            {selected === color && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <Check 
                  className={`w-5 h-5 ${
                    ['Black', 'Titanium Black', 'Black Titanium', 'Obsidian', 'Silky Black', 'Blue Titanium', 'Dark Grey'].includes(color) 
                      ? 'text-white' 
                      : 'text-primary'
                  }`} 
                  strokeWidth={3}
                />
              </motion.div>
            )}
          </div>
          <span className="text-[10px] font-medium text-muted-foreground text-center max-w-[60px] leading-tight">{color}</span>
        </motion.button>
      ))}
    </div>
  );
};
