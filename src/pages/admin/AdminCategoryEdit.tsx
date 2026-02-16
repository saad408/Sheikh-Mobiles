import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { getCategoryById, updateCategory } from '@/api/categories';
import type { CategoryUpdateInput } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AdminCategoryEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token)!;
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CategoryUpdateInput>({});

  const { data: category, isLoading, isError } = useQuery({
    queryKey: ['category', id],
    queryFn: () => getCategoryById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name,
        slug: category.slug,
        order: category.order,
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError('');
    setLoading(true);
    try {
      await updateCategory(token, id, {
        name: form.name?.trim(),
        slug: form.slug?.trim(),
        order: form.order,
      });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', id] });
      toast.success('Category updated');
      navigate('/admin/categories');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!id) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-destructive">
        Missing category ID.
      </div>
    );
  }

  if (isLoading || !category) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
        {isLoading ? 'Loading...' : 'Category not found.'}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-destructive">
        Failed to load category. It may have been deleted.
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="font-display text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Edit Category</h1>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="w-full bg-card border border-border rounded-2xl p-5 sm:p-6 lg:p-8 shadow-sm space-y-6 max-w-xl">
          <div>
            <Label className="text-muted-foreground">ID</Label>
            <p className="mt-1 font-medium text-foreground">{category.id}</p>
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
          <div>
            <Label htmlFor="slug" className="text-muted-foreground">Slug (optional)</Label>
            <input
              id="slug"
              value={form.slug ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
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
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
