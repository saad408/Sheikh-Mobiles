import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { CartItem } from '@/components/cart/CartItem';
import { useCartStore, getCartLineId } from '@/store/cartStore';
import { validateCheckout } from '@/api/checkout';
import { toast } from 'sonner';

const Cart = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, getTotalItems } = useCartStore();
  const [checkingOut, setCheckingOut] = useState(false);
  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  const shipping = 1000;
  const tax = 0;
  const total = totalPrice + shipping + tax;

  return (
    <div className="page-transition">
      <Header title="Cart" showBack />

      <div className="container-mobile pt-4 pb-44">
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-24 h-24 rounded-full gradient-primary opacity-20 flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground text-sm text-center mb-6">
              Discover amazing phones and add them to your cart.
            </p>
            <Link to="/" className="btn-accent">
              Browse Phones
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground font-medium">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </p>
            </div>

            <AnimatePresence>
              {items.map((item) => (
                <CartItem key={getCartLineId(item)} item={item} />
              ))}
            </AnimatePresence>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 bg-card rounded-2xl p-5 border border-border/50"
            >
              <h3 className="font-display text-lg font-bold mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">Rs. {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">Rs. {shipping.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">Rs. {tax.toLocaleString()}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-display font-bold">Total</span>
                  <span className="font-display text-lg font-bold">Rs. {total.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Fixed Bottom CTA */}
      {items.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 glass-card border-t border-border/50 p-4 z-30">
          <div className="container-mobile">
            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={checkingOut}
              onClick={async () => {
                setCheckingOut(true);
                try {
                  const result = await validateCheckout(
                    items.map((i) => ({
                      id: i.id,
                      quantity: i.quantity,
                      price: i.price,
                      selectedColor: i.selectedColor ?? '',
                      selectedSize: i.selectedSize ?? '',
                    }))
                  );
                  if (result.valid) {
                    navigate('/checkout');
                  } else {
                    (result.errors || ['Please fix cart issues before checkout.']).forEach((msg) =>
                      toast.error(msg)
                    );
                  }
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : 'Validation failed');
                } finally {
                  setCheckingOut(false);
                }
              }}
              className="w-full btn-accent flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {checkingOut ? (
                <>
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  );
};

export default Cart;
