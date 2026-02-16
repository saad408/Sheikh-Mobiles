import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { fetchProductById } from '@/api/products';
import { updateProduct } from '@/api/admin-products';
import { getCategories } from '@/api/categories';
import type { ProductUpdateInput, ProductColor } from '@/types/admin';
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

export default function AdminProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token)!;
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ProductUpdateInput>({});
  const [colorRows, setColorRows] = useState<ProductColor[]>([emptyColor()]);
  const [sizesText, setSizesText] = useState('');

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id!),
    enabled: !!id,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
  const categoryOptions = useMemo(() => {
    const list = categoriesData ?? [];
    const sorted = [...list].sort((a, b) => a.order - b.order);
    const names = new Set(sorted.map((c) => c.name));
    const current = form.category?.trim();
    if (current && !names.has(current)) {
      return [...sorted, { id: '', name: current, slug: '', order: 999 }];
    }
    return sorted;
  }, [categoriesData, form.category]);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        description: product.description,
        colors: product.colors,
        sizes: product.sizes,
        specs: product.specs,
      });
      setColorRows(
        product.colors?.length ? product.colors.map((c) => ({ name: c.name, hex: c.hex ?? '' })) : [emptyColor()]
      );
      setSizesText(product.sizes?.join(', ') ?? '');
    }
  }, [product]);

  const updateSpec = (key: 'processor' | 'camera' | 'battery' | 'display', value: string) => {
    setForm((f) => ({
      ...f,
      specs: {
        ...(f.specs ?? { processor: '', camera: '', battery: '', display: '' }),
        [key]: value,
      },
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
    if (!id) return;
    setError('');
    setLoading(true);
    const colors = colorRows.map((c) => ({ name: c.name.trim(), hex: (c.hex || '').trim() })).filter((c) => c.name);
    try {
      await updateProduct(token, id, {
        ...form,
        price: form.price != null ? Number(form.price) : undefined,
        colors: colors.length ? colors : undefined,
        sizes: parseList(sizesText),
        specs: form.specs,
      });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Product updated');
      navigate('/admin/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!id) {
    return (
      <div className="text-muted-foreground px-4">Invalid product ID.</div>
    );
  }

  if (isLoading || !product) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-destructive px-4">Failed to load product.</div>
    );
  }

  const specs = product.specs ?? { processor: '', camera: '', battery: '', display: '' };

  return (
    <div className="w-full">
      <h1 className="font-display text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Edit Product</h1>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="w-full bg-card border border-border rounded-2xl p-5 sm:p-6 lg:p-8 shadow-sm space-y-8">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Basic info</h2>
            <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">ID</Label>
              <p className="mt-1 font-medium text-foreground">{product.id}</p>
            </div>
            <div>
              <Label htmlFor="name" className="text-muted-foreground">Name</Label>
              <input
                id="name"
                value={form.name ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
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
                  value={form.price ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) || 0 }))}
                  required
                  className="input-field mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-muted-foreground">Category</Label>
                <select
                  id="category"
                  value={form.category ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  required
                  className="input-field mt-1.5 w-full"
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((c) => (
                    <option key={c.id || c.name} value={c.name}>
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
                value={form.image ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                required
                className="input-field mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-muted-foreground">Description</Label>
              <textarea
                id="description"
                value={form.description ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
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
                value={form.specs?.processor ?? specs.processor}
                onChange={(e) => updateSpec('processor', e.target.value)}
                className="input-field mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="spec-camera" className="text-muted-foreground">Camera</Label>
              <input
                id="spec-camera"
                value={form.specs?.camera ?? specs.camera}
                onChange={(e) => updateSpec('camera', e.target.value)}
                className="input-field mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="spec-battery" className="text-muted-foreground">Battery</Label>
              <input
                id="spec-battery"
                value={form.specs?.battery ?? specs.battery}
                onChange={(e) => updateSpec('battery', e.target.value)}
                className="input-field mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="spec-display" className="text-muted-foreground">Display</Label>
              <input
                id="spec-display"
                value={form.specs?.display ?? specs.display}
                onChange={(e) => updateSpec('display', e.target.value)}
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
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
