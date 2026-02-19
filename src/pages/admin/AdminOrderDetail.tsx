import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Mail, Phone, MapPin, Package, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { fetchOrderById, updateOrderStatus } from '@/api/admin-orders';
import { getProductImageUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  processing: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  shipped: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  delivered: 'bg-green-500/10 text-green-600 dark:text-green-400',
  cancelled: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminOrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token)!;
  const [updating, setUpdating] = useState(false);

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['admin', 'order', orderId],
    queryFn: () => fetchOrderById(token, orderId!),
    enabled: !!orderId,
  });

  const handleStatusUpdate = async (newStatus: string) => {
    if (!orderId || !order) return;
    setUpdating(true);
    try {
      await updateOrderStatus(token, orderId, newStatus as any);
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success('Order status updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (!orderId) {
    return (
      <div className="text-muted-foreground px-4">Invalid order ID.</div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="text-destructive px-4">Failed to load order.</div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/orders')}
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="font-display text-2xl font-bold">Order Details</h1>
      </div>

      <div className="space-y-6">
        {/* Order Header */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Order ID</p>
              <p className="font-mono font-bold text-lg">{order.orderId}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                className={STATUS_COLORS[order.status] || 'bg-muted text-muted-foreground'}
              >
                {order.status}
              </Badge>
              <select
                value={order.status}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                disabled={updating}
                className="input-field rounded-xl text-sm"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Created</p>
              <p className="font-medium">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Updated</p>
              <p className="font-medium">
                {new Date(order.updatedAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Items</p>
              <p className="font-medium">{order.items.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Total</p>
              <p className="font-bold text-lg">Rs. {order.total.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Name</p>
              <p className="font-medium">
                {order.shipping.firstName} {order.shipping.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </p>
              <a
                href={`mailto:${order.shipping.email}`}
                className="font-medium text-primary hover:underline"
              >
                {order.shipping.email}
              </a>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone
              </p>
              <a
                href={`tel:${order.shipping.phone}`}
                className="font-medium text-primary hover:underline"
              >
                {order.shipping.phone}
              </a>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address
              </p>
              <p className="font-medium">
                {order.shipping.address}
                <br />
                {order.shipping.city}, {order.shipping.postalCode}
                <br />
                {order.shipping.country}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Order Items</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Variation</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item, idx) => (
                  <TableRow key={idx} className="border-border">
                    <TableCell>
                      <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                        <img
                          src={getProductImageUrl(item.image)}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </TableCell>
                    <TableCell>
                      {item.selectedColor && (
                        <p className="text-sm">
                          <span className="text-muted-foreground">Color:</span> {item.selectedColor}
                        </p>
                      )}
                      {item.selectedSize && (
                        <p className="text-sm">
                          <span className="text-muted-foreground">Storage:</span> {item.selectedSize}
                        </p>
                      )}
                      {!item.selectedColor && !item.selectedSize && (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">Rs. {item.price.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right font-medium">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">Rs. {order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">
                {order.shippingCost === 0 ? 'Free' : `Rs. ${order.shippingCost.toLocaleString()}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-medium">Rs. {order.tax.toLocaleString()}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="font-display font-bold">Total</span>
              <span className="font-display text-lg font-bold">Rs. {order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
