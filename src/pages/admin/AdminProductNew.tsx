import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { createProduct } from '@/api/admin-products';
import { getCategories } from '@/api/categories';
import { uploadProductImage, validateProductImageFile } from '@/api/upload';
import { getProductImageUrl } from '@/lib/api';
import type { ProductCreateInput, VariationRowWithColor } from '@/types/admin';
import { STORAGE_OPTIONS } from '@/constants/storageOptions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

function toColorInputValue(hex: string): string {
  const h = (hex || '').replace(/^#/, '').trim();
  if (/^[0-9A-Fa-f]{6}$/.test(h)) return '#' + h;
  if (/^[0-9A-Fa-f]{3}$/.test(h)) return '#' + h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  return '#cccccc';
}

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
  const [variationRows, setVariationRows] = useState<VariationRowWithColor[]>([
    { color: '', hex: '#cccccc', storage: STORAGE_OPTIONS[0], quantity: 0, price: 0 },
  ]);
  const derivedSizes = useMemo(
    () =>
      [...new Set(variationRows.map((r) => r.storage).filter(Boolean))].sort(
        (a, b) => STORAGE_OPTIONS.indexOf(a as (typeof STORAGE_OPTIONS)[number]) - STORAGE_OPTIONS.indexOf(b as (typeof STORAGE_OPTIONS)[number])
      ),
    [variationRows]
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewImageError, setPreviewImageError] = useState(false);

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

  const updateVariationRow = (index: number, patch: Partial<VariationRowWithColor>) => {
    setVariationRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };
  const addVariationRow = () =>
    setVariationRows((prev) => [...prev, { color: '', hex: '#cccccc', storage: STORAGE_OPTIONS[0], quantity: 0, price: form.price || 0 }]);
  const removeVariationRow = (index: number) =>
    setVariationRows((prev) => prev.filter((_, i) => i !== index));

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadError('');
    const validation = validateProductImageFile(file);
    if (validation) {
      setUploadError(validation);
      return;
    }
    setUploading(true);
    try {
      const { url } = await uploadProductImage(token, file);
      setForm((f) => ({ ...f, image: url }));
      toast.success('Image uploaded');
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const filledRows = variationRows.filter((r) => r.color.trim() && r.storage.trim());
    const key = (r: VariationRowWithColor) => `${r.color.trim()}|${r.storage.trim()}`;
    const seen = new Set<string>();
    const duplicate = filledRows.find((r) => {
      const k = key(r);
      if (seen.has(k)) return true;
      seen.add(k);
      return false;
    });
    if (duplicate) {
      setError(`Duplicate variation: "${duplicate.color}" + "${duplicate.storage}" appears more than once. Each color and storage combination must be unique.`);
      return;
    }
    setLoading(true);
    try {
      const stockByVariation = variationRows
        .map((r) => ({
          color: r.color.trim(),
          storage: r.storage.trim(),
          quantity: Math.max(0, Number(r.quantity) || 0),
        }))
        .filter((r) => r.quantity > 0 || r.color !== '' || r.storage !== '');
      const pricesByVariation = variationRows
        .filter((r) => r.color.trim() || r.storage.trim())
        .map((r) => ({
          color: r.color.trim(),
          storage: r.storage.trim(),
          price: Math.max(0, Number(r.price) || 0),
        }))
        .filter((r) => r.price > 0 || r.color !== '' || r.storage !== '');
      const colorNamesSeen = new Set<string>();
      const colors = variationRows
        .filter((r) => r.color.trim())
        .map((r) => ({ name: r.color.trim(), hex: (r.hex || '#cccccc').trim() }))
        .filter((c) => {
          if (colorNamesSeen.has(c.name)) return false;
          colorNamesSeen.add(c.name);
          return true;
        });
      await createProduct(token, {
        ...form,
        price: Number(form.price) || 0,
        colors: colors.length ? colors : undefined,
        sizes: derivedSizes,
        specs: form.specs,
        stockByVariation: stockByVariation.length ? stockByVariation : undefined,
        pricesByVariation: pricesByVariation.length ? pricesByVariation : undefined,
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
                <Label htmlFor="price" className="text-muted-foreground">Price (Rs.)</Label>
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
              <Label className="text-muted-foreground">Image</Label>
              {form.image ? (
                <div className="mt-1.5 flex items-start gap-4">
                  <div className="w-24 h-24 rounded-xl border border-border bg-muted overflow-hidden flex items-center justify-center shrink-0">
                    {previewImageError ? (
                      <span className="text-xs text-muted-foreground text-center px-2">Image not found</span>
                    ) : (
                      <img
                        src={getProductImageUrl(form.image)}
                        alt="Preview"
                        className="w-full h-full object-contain"
                        onLoad={() => setPreviewImageError(false)}
                        onError={() => setPreviewImageError(true)}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <input
                      id="image"
                      value={form.image}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, image: e.target.value }));
                        setPreviewImageError(false);
                      }}
                      placeholder="/uploads/products/..."
                      required
                      className="input-field w-full"
                    />
                    <p className="text-xs text-muted-foreground">Or upload a new image below to replace.</p>
                  </div>
                </div>
              ) : (
                <input
                  id="image"
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  placeholder="Upload image or paste URL"
                  required
                  className="input-field mt-1.5"
                />
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    disabled={uploading}
                    onChange={handleImageFileChange}
                  />
                  <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-secondary text-secondary-foreground hover:bg-muted border border-border">
                    {uploading ? 'Uploading...' : 'Upload image (max 5MB)'}
                  </span>
                </label>
              </div>
              {uploadError && (
                <p className="mt-1.5 text-sm text-destructive">{uploadError}</p>
              )}
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
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Variations</h2>
            <p className="text-sm text-muted-foreground mb-4">One row per variant: color name, hex, storage, quantity, and price (Rs.). Sizes below are derived from these rows.</p>
            <div className="space-y-3">
              {variationRows.map((row, index) => (
                <div key={index} className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-muted/40 border border-border/50">
                  <input
                    type="text"
                    value={row.color}
                    onChange={(e) => updateVariationRow(index, { color: e.target.value })}
                    placeholder="Color name"
                    className="input-field w-36 min-w-0 rounded-xl text-sm"
                  />
                  <input
                    type="text"
                    value={row.hex}
                    onChange={(e) => updateVariationRow(index, { hex: e.target.value })}
                    placeholder="#hex"
                    className="input-field w-24 font-mono text-sm rounded-xl"
                  />
                  <label className="relative w-10 h-10 shrink-0 cursor-pointer block rounded-full overflow-hidden border-2 border-border shadow-sm hover:border-primary/50 transition-colors focus-within:ring-2 focus-within:ring-primary/30 focus-within:ring-offset-2">
                    <span className="absolute inset-0 rounded-full" style={{ backgroundColor: row.hex || '#ccc' }} aria-hidden />
                    <input
                      type="color"
                      value={toColorInputValue(row.hex)}
                      onChange={(e) => updateVariationRow(index, { hex: e.target.value })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      title="Pick color"
                    />
                  </label>
                  <select
                    value={STORAGE_OPTIONS.includes(row.storage as (typeof STORAGE_OPTIONS)[number]) ? row.storage : ''}
                    onChange={(e) => updateVariationRow(index, { storage: e.target.value })}
                    className="input-field w-28 min-w-0 rounded-xl"
                  >
                    <option value="">Storage</option>
                    {STORAGE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    value={row.quantity}
                    onChange={(e) => updateVariationRow(index, { quantity: Number(e.target.value) || 0 })}
                    placeholder="Qty"
                    className="input-field w-24"
                  />
                  <input
                    type="number"
                    min={0}
                    value={row.price}
                    onChange={(e) => updateVariationRow(index, { price: Number(e.target.value) || 0 })}
                    placeholder="Rs."
                    className="input-field w-28"
                    title="Price (PKR)"
                  />
                  <Button type="button" variant="ghost" size="sm" className="rounded-lg text-destructive hover:text-destructive" onClick={() => removeVariationRow(index)} disabled={variationRows.length <= 1}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={addVariationRow}>
                <Plus className="w-4 h-4 mr-2" />
                Add variation row
              </Button>
            </div>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Sizes</h2>
            <p className="text-sm text-muted-foreground mb-2">Derived from variations above (read-only).</p>
            <input
              id="sizes"
              readOnly
              value={derivedSizes.join(', ')}
              className="input-field mt-1.5 bg-muted/50 cursor-default"
              placeholder="Add variation rows above to see storages"
            />
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
