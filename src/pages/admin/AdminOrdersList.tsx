import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Package } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { fetchOrders } from '@/api/admin-orders';
import { ProductsPagination } from '@/components/ui/ProductsPagination';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const LIMIT = 20;

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  processing: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  shipped: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  delivered: 'bg-green-500/10 text-green-600 dark:text-green-400',
  cancelled: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

export default function AdminOrdersList() {
  const token = useAuthStore((s) => s.token)!;
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'orders', page, statusFilter, searchQuery],
    queryFn: () =>
      fetchOrders(token, {
        page,
        limit: LIMIT,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      }),
  });

  const orders = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Orders</h1>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by order ID, email, phone, or name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="input-field pl-10 w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="input-field w-full sm:w-48"
        >
          <option value="">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          Loading...
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-destructive">
          Something went wrong. Please try again later.
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          No orders found.
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-28 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.orderId} className="border-border">
                    <TableCell className="font-mono text-sm">
                      {order.orderId}
                    </TableCell>
                    <TableCell>
                      {order.shipping.firstName} {order.shipping.lastName}
                    </TableCell>
                    <TableCell className="text-sm">{order.shipping.email}</TableCell>
                    <TableCell className="text-sm">{order.shipping.phone}</TableCell>
                    <TableCell className="text-right font-medium">
                      Rs. {order.total.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={STATUS_COLORS[order.status] || 'bg-muted text-muted-foreground'}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="rounded-xl"
                      >
                        <Link to={`/admin/orders/${order.orderId}`}>
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {pagination && (
            <div className="mt-6">
              <ProductsPagination
                pagination={pagination}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
