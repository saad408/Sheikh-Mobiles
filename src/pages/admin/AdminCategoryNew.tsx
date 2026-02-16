import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { createCategory } from '@/api/categories';
import type { CategoryCreateInput } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AdminCategoryNew() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token)!;
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CategoryCreateInput>({
    name: '',
    slug: '',
    order: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createCategory(token, {
        name: form.name.trim(),
        slug: form.slug?.trim() || undefined,
        order: form.order ?? 0,
      });
      toast.success('Category created');
      navigate('/admin/categories');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="font-display text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">New Category</h1>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="w-full bg-card border border-border rounded-2xl p-5 sm:p-6 lg:p-8 shadow-sm space-y-6 max-w-xl">
          <div>
            <Label htmlFor="name" className="text-muted-foreground">Name</Label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Apple"
              required
              className="input-field mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="slug" className="text-muted-foreground">Slug (optional)</Label>
            <input
              id="slug"
              value={form.slug ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="e.g. apple"
              className="input-field mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="order" className="text-muted-foreground">Order</Label>
            <input
              id="order"
              type="number"
              min={0}
              value={form.order ?? 0}
              onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) || 0 }))}
              className="input-field mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">Lower number appears first in filters.</p>
          </div>
          {error && (
            <p className="text-sm text-destructive font-medium bg-destructive/10 rounded-xl px-4 py-3">{error}</p>
          )}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => navigate('/admin/categories')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="rounded-xl">
              {loading ? 'Creating...' : 'Create Category'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
