import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { fetchProductById } from '@/api/products';
import { updateProduct } from '@/api/admin-products';
import { getCategories } from '@/api/categories';
import { uploadProductImage, validateProductImageFile } from '@/api/upload';
import { getProductImageUrl } from '@/lib/api';
import type { ProductUpdateInput, ProductColor, StockByVariationItem } from '@/types/admin';
import { STORAGE_OPTIONS } from '@/constants/storageOptions';
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
  const [variationRows, setVariationRows] = useState<StockByVariationItem[]>([{ color: '', storage: '', quantity: 0 }]);
  const [sizesText, setSizesText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewImageError, setPreviewImageError] = useState(false);

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
      setPreviewImageError(false);
      setColorRows(
        product.colors?.length ? product.colors.map((c) => ({ name: c.name, hex: c.hex ?? '' })) : [emptyColor()]
      );
      setVariationRows(
        product.stockByVariation?.length
          ? product.stockByVariation.map((s) => ({ color: s.color, storage: s.storage, quantity: s.quantity }))
          : [{ color: '', storage: '', quantity: 0 }]
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

  const colorOptions = useMemo(() => {
    const fromRows = colorRows.map((c) => c.name.trim()).filter(Boolean);
    const fromVariations = variationRows.map((r) => r.color.trim()).filter(Boolean);
    const set = new Set([...fromRows, ...fromVariations]);
    return Array.from(set);
  }, [colorRows, variationRows]);

  const storageOptionsForEdit = useMemo(() => {
    const extra = variationRows.map((r) => r.storage.trim()).filter(Boolean);
    const set = new Set([...STORAGE_OPTIONS, ...extra]);
    return Array.from(set);
  }, [variationRows]);

  const updateVariationRow = (index: number, color: string, storage: string, quantity: number) => {
    setVariationRows((prev) => {
      const next = [...prev];
      next[index] = { color, storage, quantity };
      return next;
    });
  };
  const addVariationRow = () =>
    setVariationRows((prev) => [...prev, { color: colorOptions[0] ?? '', storage: STORAGE_OPTIONS[0], quantity: 0 }]);
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
    if (!id) return;
    setError('');
    const colors = colorRows.map((c) => ({ name: c.name.trim(), hex: (c.hex || '').trim() })).filter((c) => c.name);
    const filledRows = variationRows.filter((r) => r.color.trim() && r.storage.trim());
    const key = (r: StockByVariationItem) => `${r.color.trim()}|${r.storage.trim()}`;
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
      await updateProduct(token, id, {
        ...form,
        price: form.price != null ? Number(form.price) : undefined,
        colors: colors.length ? colors : undefined,
        sizes: parseList(sizesText),
        specs: form.specs,
        stockByVariation: stockByVariation.length ? stockByVariation : undefined,
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
                <Label htmlFor="price" className="text-muted-foreground">Price (Rs.)</Label>
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
                      value={form.image ?? ''}
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
                  value={form.image ?? ''}
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
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Stock by variation</h2>
            <p className="text-sm text-muted-foreground mb-4">Per color + storage. Choose a color from the list above and set storage size and quantity for each variant.</p>
            <div className="space-y-3">
              {variationRows.map((row, index) => (
                <div key={index} className="flex flex-wrap items-center gap-2">
                  <select
                    value={row.color}
                    onChange={(e) => updateVariationRow(index, e.target.value, row.storage, row.quantity)}
                    className="input-field w-40 min-w-0 rounded-xl"
                  >
                    <option value="">Select color</option>
                    {colorOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={storageOptionsForEdit.includes(row.storage) ? row.storage : ''}
                    onChange={(e) => updateVariationRow(index, row.color, e.target.value, row.quantity)}
                    className="input-field w-28 min-w-0 rounded-xl"
                  >
                    <option value="">Storage</option>
                    {storageOptionsForEdit.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    value={row.quantity}
                    onChange={(e) => updateVariationRow(index, row.color, row.storage, Number(e.target.value) || 0)}
                    placeholder="Qty"
                    className="input-field w-24"
                  />
                  <Button type="button" variant="ghost" size="sm" className="rounded-lg text-destructive hover:text-destructive" onClick={() => removeVariationRow(index)} disabled={variationRows.length <= 1}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={addVariationRow}
                disabled={colorOptions.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add variation row
              </Button>
              {colorOptions.length === 0 && (
                <p className="text-sm text-muted-foreground">Add at least one color above to add variations.</p>
              )}
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
