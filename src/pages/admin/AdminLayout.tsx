import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { admin, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/admin/products" className="font-display font-bold text-lg text-foreground">
              Sheikh Mobiles Admin
            </Link>
            <nav className="flex items-center gap-2">
              <Link
                to="/admin/products"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                <Package className="w-4 h-4" />
                Products
              </Link>
              <Link
                to="/admin/products/new"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-primary hover:bg-primary/10"
              >
                <LayoutDashboard className="w-4 h-4" />
                New Product
              </Link>
              <Link
                to="/admin/categories"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                <FolderTree className="w-4 h-4" />
                Categories
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{admin?.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="rounded-xl text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}
