import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CreditCard, Truck, Lock, ChevronRight, Package, AlertCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { useCartStore } from '@/store/cartStore';
import { validateCheckout } from '@/api/checkout';
import { createOrder } from '@/api/orders';
import type { CheckoutValidateResponse } from '@/api/checkout';
import { toast } from 'sonner';

type Step = 'shipping' | 'payment' | 'confirmation';
const steps: Step[] = ['shipping', 'payment', 'confirmation'];

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [validation, setValidation] = useState<{
    result: CheckoutValidateResponse | null;
    loading: boolean;
    error: string | null;
  }>({ result: null, loading: false, error: null });

  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: '',
  });

  useEffect(() => {
    if (items.length === 0) return;
    setValidation((v) => ({ ...v, loading: true, error: null }));
    validateCheckout(
      items.map((i) => ({
        id: i.id,
        quantity: i.quantity,
        price: i.price,
        selectedColor: i.selectedColor ?? '',
        selectedSize: i.selectedSize ?? '',
      }))
    )
      .then((result) => {
        setValidation({ result, loading: false, error: null });
      })
      .catch((err) => {
        setValidation({
          result: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Validation failed',
        });
      });
  }, [items]);

  useEffect(() => {
    if (validation.loading || !validation.result) return;
    if (!validation.result.valid) {
      const messages = validation.result.errors?.length
        ? validation.result.errors
        : ['Please fix cart issues before checkout.'];
      messages.forEach((msg) => toast.error(msg));
      navigate('/cart', { replace: true });
    }
  }, [validation.loading, validation.result, navigate]);

  const validResult = validation.result?.valid ? validation.result : null;
  const totalPrice = getTotalPrice();
  const shippingClient = totalPrice > 500 ? 0 : 15;
  const taxClient = Math.round(totalPrice * 0.08);
  const totalClient = totalPrice + shippingClient + taxClient;

  const subtotal = validResult?.subtotal ?? totalPrice;
  const shipping = validResult?.shippingCost ?? shippingClient;
  const tax = validResult?.tax ?? taxClient;
  const total = validResult?.total ?? totalClient;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const orderItems = items.map((item, index) => {
        const validated = validation.result?.validatedItems?.[index];
        const price = validated?.currentPrice ?? item.price;
        return {
          id: item.id,
          quantity: item.quantity,
          price,
          selectedColor: item.selectedColor ?? '',
          selectedSize: item.selectedSize ?? '',
        };
      });
      const res = await createOrder({
        items: orderItems,
        subtotal,
        shippingCost: shipping,
        tax,
        total,
        shipping: shippingInfo,
      });
      setOrderId(res.orderId ?? null);
      clearCart();
      setStep('confirmation');
      toast.success('Order placed successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Order failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && step !== 'confirmation') {
    navigate('/cart');
    return null;
  }

  if (!validation.loading && validation.result && !validation.result.valid) {
    return (
      <div className="page-transition flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-muted-foreground">
          <p className="font-medium">Cart has issues. Redirecting to cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition">
      <Header title="Checkout" showBack />

      <div className="container-mobile pt-4 pb-32">
        {validation.loading && (
          <div className="mb-4 py-3 px-4 rounded-xl bg-muted text-muted-foreground text-sm text-center">
            Verifying cart...
          </div>
        )}
        {validation.result && !validation.result.valid && validation.result.errors?.length && (
          <div className="mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30">
            <div className="flex items-center gap-2 text-destructive font-semibold mb-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Cart issues
            </div>
            <ul className="text-sm text-destructive list-disc list-inside space-y-1">
              {validation.result.errors.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground mt-2">
              Update quantities or remove items, then we&apos;ll re-check.
            </p>
          </div>
        )}
        {validation.error && (
          <div className="mb-4 py-3 px-4 rounded-xl bg-destructive/10 text-destructive text-sm">
            {validation.error}
          </div>
        )}

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step === s
                    ? 'gradient-primary text-primary-foreground shadow-glow'
                    : steps.indexOf(s) < steps.indexOf(step)
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {steps.indexOf(s) < steps.indexOf(step) ? (
                  <Check className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && (
                <div
                  className={`w-10 h-1 rounded-full transition-colors ${
                    steps.indexOf(s) < steps.indexOf(step)
                      ? 'bg-accent'
                      : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 'shipping' && (
            <motion.form
              key="shipping"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleShippingSubmit}
              className="space-y-6"
            >
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                    <Truck className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h2 className="font-display text-xl font-bold">Shipping Details</h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.firstName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.lastName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                  <input
                    type="email"
                    required
                    value={shippingInfo.email}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="mt-3">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone</label>
                  <input
                    type="tel"
                    required
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="mt-3">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Address</label>
                  <input
                    type="text"
                    required
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">City</label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.postalCode}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Country</label>
                  <input
                    type="text"
                    required
                    value={shippingInfo.country}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                Continue to Payment
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.form>
          )}

          {step === 'payment' && (
            <motion.form
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handlePaymentSubmit}
              className="space-y-6"
            >
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h2 className="font-display text-xl font-bold">Payment</h2>
                </div>

                <div className="bg-secondary rounded-xl p-4 mb-5 flex items-center gap-3">
                  <Lock className="w-5 h-5 text-accent" />
                  <p className="text-sm text-muted-foreground">
                    Your payment info is secure and encrypted
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Card Number</label>
                  <input
                    type="text"
                    required
                    placeholder="1234 5678 9012 3456"
                    value={paymentInfo.cardNumber}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Expiry</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={paymentInfo.expiry}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, expiry: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">CVV</label>
                    <input
                      type="text"
                      required
                      placeholder="123"
                      value={paymentInfo.cvv}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name on Card</label>
                  <input
                    type="text"
                    required
                    value={paymentInfo.name}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, name: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-card rounded-2xl p-5 border border-border/50">
                <h3 className="font-display font-bold mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">Rs. {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">{shipping === 0 ? 'Free' : `Rs. ${shipping}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">Rs. {tax}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="font-display font-bold">Total</span>
                    <span className="font-display text-lg font-bold">Rs. {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isProcessing}
                className="w-full btn-accent flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pay Rs. {total.toLocaleString()}
                  </>
                )}
              </motion.button>
            </motion.form>
          )}

          {step === 'confirmation' && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6"
              >
                <Package className="w-12 h-12 text-accent" />
              </motion.div>
              <h2 className="font-display text-2xl font-bold mb-2">
                Order Confirmed! 🎉
              </h2>
              <p className="text-muted-foreground mb-6">
                We've sent a confirmation to {shippingInfo.email || 'your email'}
              </p>
              <p className="text-sm font-mono bg-secondary px-4 py-2 rounded-lg inline-block mb-8">
                Order #{orderId || Date.now().toString().slice(-8)}
              </p>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/')}
                className="btn-primary w-full"
              >
                Continue Shopping
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <MobileNav />
    </div>
  );
};

export default Checkout;
