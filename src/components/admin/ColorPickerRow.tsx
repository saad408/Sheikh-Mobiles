import type { ProductColor } from '@/types/admin';

function toColorInputValue(hex: string): string {
  const h = (hex || '').replace(/^#/, '').trim();
  if (/^[0-9A-Fa-f]{6}$/.test(h)) return '#' + h;
  if (/^[0-9A-Fa-f]{3}$/.test(h))
    return '#' + h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  return '#cccccc';
}

interface ColorPickerRowProps {
  name: string;
  hex: string;
  onNameChange: (name: string) => void;
  onHexChange: (hex: string) => void;
  onRemove: () => void;
  namePlaceholder?: string;
  hexPlaceholder?: string;
}

export function ColorPickerRow({
  name,
  hex,
  onNameChange,
  onHexChange,
  onRemove,
  namePlaceholder = 'Color name',
  hexPlaceholder = '#hex',
}: ColorPickerRowProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center p-3 rounded-xl bg-muted/40 border border-border/50">
      <input
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder={namePlaceholder}
        className="input-field flex-1 min-w-0 rounded-xl text-sm"
      />
      <div className="flex items-center gap-2 min-w-0">
        <input
          type="text"
          value={hex}
          onChange={(e) => onHexChange(e.target.value)}
          placeholder={hexPlaceholder}
          className="input-field w-28 rounded-xl font-mono text-sm"
        />
        <label className="relative w-10 h-10 shrink-0 cursor-pointer block rounded-full overflow-hidden border-2 border-border shadow-sm hover:border-primary/50 transition-colors focus-within:ring-2 focus-within:ring-primary/30 focus-within:ring-offset-2">
          <span
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: hex || '#ccc' }}
            aria-hidden
          />
          <input
            type="color"
            value={toColorInputValue(hex)}
            onChange={(e) => onHexChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title="Pick color"
          />
        </label>
        <button
          type="button"
          onClick={onRemove}
          className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
          aria-label="Remove color"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" x2="10" y1="11" y2="17" />
            <line x1="14" x2="14" y1="11" y2="17" />
          </svg>
        </button>
      </div>
    </div>
  );
}
