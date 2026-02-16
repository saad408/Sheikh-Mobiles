import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { createProduct } from '@/api/admin-products';
import { getCategories } from '@/api/categories';
import type { ProductCreateInput, ProductColor } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ColorPickerRow } from '@/components/admin/ColorPickerRow';
import { toast } from 'sonner';

function parseList(s: string): string[] {
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

const emptyColor = (): ProductColor => ({ name: '', hex: '' });

export default function AdminProductNew() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token)!;
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ProductCreateInput>({
    id: '',
    name: '',
    price: 0,
    image: '',
    category: '',
    description: '',
    colors: [],
    sizes: [],
    specs: { processor: '', camera: '', battery: '', display: '' },
  });
  const [colorRows, setColorRows] = useState<ProductColor[]>([emptyColor()]);
  const [sizesText, setSizesText] = useState('');

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
  const categoryOptions = useMemo(() => {
    const list = categoriesData ?? [];
    return [...list].sort((a, b) => a.order - b.order);
  }, [categoriesData]);

  const updateSpec = (key: keyof NonNullable<ProductCreateInput['specs']>, value: string) => {
    setForm((f) => ({
      ...f,
      specs: { ...(f.specs ?? { processor: '', camera: '', battery: '', display: '' }), [key]: value },
    }));
  };

  const updateColor = (index: number, name: string, hex: string) => {
    setColorRows((prev) => {
      const next = [...prev];
      next[index] = { name, hex };
      return next;
    });
  };

  const addColor = () => setColorRows((prev) => [...prev, emptyColor()]);
  const removeColor = (index: number) =>
    setColorRows((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const colors = colorRows.map((c) => ({ name: c.name.trim(), hex: (c.hex || '').trim() })).filter((c) => c.name);
    try {
      await createProduct(token, {
        ...form,
        price: Number(form.price) || 0,
        colors: colors.length ? colors : undefined,
        sizes: parseList(sizesText),
        specs: form.specs,
      });
      toast.success('Product created');
      navigate('/admin/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="font-display text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">New Product</h1>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="w-full bg-card border border-border rounded-2xl p-5 sm:p-6 lg:p-8 shadow-sm space-y-8">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Basic info</h2>
            <div className="space-y-4">
            <div>
              <Label htmlFor="id" className="text-muted-foreground">ID</Label>
              <input
                id="id"
                value={form.id}
                onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
                placeholder="e.g. 20"
                required
                className="input-field mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="name" className="text-muted-foreground">Name</Label>
              <input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Product name"
                required
                className="input-field mt-1.5"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="text-muted-foreground">Price ($)</Label>
                <input
                  id="price"
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.price || ''}
                  onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) || 0 }))}
                  required
                  className="input-field mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-muted-foreground">Category</Label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  required
                  className="input-field mt-1.5 w-full"
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="image" className="text-muted-foreground">Image URL</Label>
              <input
                id="image"
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                placeholder="/products/photo.jpg"
                required
                className="input-field mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-muted-foreground">Description</Label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Product description"
                required
                rows={4}
                className="input-field mt-1.5 min-h-[100px] resize-y"
              />
            </div>
            </div>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Specs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="spec-processor" className="text-muted-foreground">Processor</Label>
                <input
                id="spec-processor"
                value={form.specs?.processor ?? ''}
                onChange={(e) => updateSpec('processor', e.target.value)}
                placeholder="e.g. A17 Pro"
                className="input-field mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="spec-camera" className="text-muted-foreground">Camera</Label>
                <input
                  id="spec-camera"
                  value={form.specs?.camera ?? ''}
                  onChange={(e) => updateSpec('camera', e.target.value)}
                  placeholder="e.g. 48MP Pro"
                  className="input-field mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="spec-battery" className="text-muted-foreground">Battery</Label>
                <input
                  id="spec-battery"
                  value={form.specs?.battery ?? ''}
                  onChange={(e) => updateSpec('battery', e.target.value)}
                  placeholder="e.g. All-Day"
                  className="input-field mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="spec-display" className="text-muted-foreground">Display</Label>
                <input
                  id="spec-display"
                  value={form.specs?.display ?? ''}
                  onChange={(e) => updateSpec('display', e.target.value)}
                  placeholder="e.g. Super Retina XDR"
                  className="input-field mt-1.5"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Colors</h2>
            <p className="text-sm text-muted-foreground mb-4">Name and hex for each color. Click the circle to pick a color.</p>
            <div className="space-y-3">
            {colorRows.map((row, index) => (
              <ColorPickerRow
                key={index}
                name={row.name}
                hex={row.hex}
                onNameChange={(name) => updateColor(index, name, row.hex)}
                onHexChange={(hex) => updateColor(index, row.name, hex)}
                onRemove={() => removeColor(index)}
              />
            ))}
            <Button type="button" variant="outline" size="sm" className="rounded-xl w-full sm:w-auto" onClick={addColor}>
              <Plus className="w-4 h-4 mr-2" />
              Add color
            </Button>
            </div>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Sizes</h2>
            <div>
              <Label htmlFor="sizes" className="text-muted-foreground">Comma-separated (e.g. 128GB, 256GB)</Label>
              <input
                id="sizes"
                value={sizesText}
                onChange={(e) => setSizesText(e.target.value)}
                placeholder="128GB, 256GB, 512GB"
                className="input-field mt-1.5"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive font-medium bg-destructive/10 rounded-xl px-4 py-3">{error}</p>
          )}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl order-2 sm:order-1"
              onClick={() => navigate('/admin/products')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="rounded-xl order-1 sm:order-2">
              {loading ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
