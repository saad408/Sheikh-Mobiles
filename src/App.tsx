import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/admin/ProtectedRoute";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminProductList from "./pages/admin/AdminProductList";
import AdminProductNew from "./pages/admin/AdminProductNew";
import AdminProductEdit from "./pages/admin/AdminProductEdit";
import AdminCategoriesList from "./pages/admin/AdminCategoriesList";
import AdminCategoryNew from "./pages/admin/AdminCategoryNew";
import AdminCategoryEdit from "./pages/admin/AdminCategoryEdit";
import AdminOrdersList from "./pages/admin/AdminOrdersList";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/search" element={<Search />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="products" replace />} />
            <Route path="products" element={<AdminProductList />} />
            <Route path="products/new" element={<AdminProductNew />} />
            <Route path="products/edit/:id" element={<AdminProductEdit />} />
            <Route path="categories" element={<AdminCategoriesList />} />
            <Route path="categories/new" element={<AdminCategoryNew />} />
            <Route path="categories/edit/:id" element={<AdminCategoryEdit />} />
            <Route path="orders" element={<AdminOrdersList />} />
            <Route path="orders/:orderId" element={<AdminOrderDetail />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
