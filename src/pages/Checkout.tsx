import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Lock, AlertCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { useCartStore } from '@/store/cartStore';
import { validateCheckout } from '@/api/checkout';
import { createOrder } from '@/api/orders';
import type { CheckoutValidateResponse } from '@/api/checkout';
import { toast } from 'sonner';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
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

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

  const validateField = (name: string, value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) return `${name} is required`;
    
    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) return 'Please enter a valid email address';
        break;
      case 'phone':
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(trimmed) || trimmed.length < 8) return 'Please enter a valid phone number';
        break;
      case 'postalCode':
        if (trimmed.length < 3) return 'Postal code must be at least 3 characters';
        break;
      case 'firstName':
      case 'lastName':
        if (trimmed.length < 2) return `${name} must be at least 2 characters`;
        break;
      case 'address':
        if (trimmed.length < 5) return 'Address must be at least 5 characters';
        break;
      case 'city':
      case 'country':
        if (trimmed.length < 2) return `${name} must be at least 2 characters`;
        break;
    }
    return '';
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    Object.entries(shippingInfo).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) {
        errors[key] = error;
        isValid = false;
      }
    });

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill all fields correctly');
      return;
    }

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
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Order failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
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

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
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
                      onChange={(e) => {
                        setShippingInfo({ ...shippingInfo, firstName: e.target.value });
                        if (fieldErrors.firstName) {
                          const error = validateField('firstName', e.target.value);
                          setFieldErrors({ ...fieldErrors, firstName: error });
                        }
                      }}
                      onBlur={(e) => {
                        const error = validateField('firstName', e.target.value);
                        setFieldErrors({ ...fieldErrors, firstName: error });
                      }}
                      className={`input-field ${fieldErrors.firstName ? 'border-destructive' : ''}`}
                    />
                    {fieldErrors.firstName && (
                      <p className="text-xs text-destructive mt-1">{fieldErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.lastName}
                      onChange={(e) => {
                        setShippingInfo({ ...shippingInfo, lastName: e.target.value });
                        if (fieldErrors.lastName) {
                          const error = validateField('lastName', e.target.value);
                          setFieldErrors({ ...fieldErrors, lastName: error });
                        }
                      }}
                      onBlur={(e) => {
                        const error = validateField('lastName', e.target.value);
                        setFieldErrors({ ...fieldErrors, lastName: error });
                      }}
                      className={`input-field ${fieldErrors.lastName ? 'border-destructive' : ''}`}
                    />
                    {fieldErrors.lastName && (
                      <p className="text-xs text-destructive mt-1">{fieldErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                  <input
                    type="email"
                    required
                    value={shippingInfo.email}
                    onChange={(e) => {
                      setShippingInfo({ ...shippingInfo, email: e.target.value });
                      if (fieldErrors.email) {
                        const error = validateField('email', e.target.value);
                        setFieldErrors({ ...fieldErrors, email: error });
                      }
                    }}
                    onBlur={(e) => {
                      const error = validateField('email', e.target.value);
                      setFieldErrors({ ...fieldErrors, email: error });
                    }}
                    className={`input-field ${fieldErrors.email ? 'border-destructive' : ''}`}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                <div className="mt-3">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone</label>
                  <input
                    type="tel"
                    required
                    value={shippingInfo.phone}
                    onChange={(e) => {
                      setShippingInfo({ ...shippingInfo, phone: e.target.value });
                      if (fieldErrors.phone) {
                        const error = validateField('phone', e.target.value);
                        setFieldErrors({ ...fieldErrors, phone: error });
                      }
                    }}
                    onBlur={(e) => {
                      const error = validateField('phone', e.target.value);
                      setFieldErrors({ ...fieldErrors, phone: error });
                    }}
                    className={`input-field ${fieldErrors.phone ? 'border-destructive' : ''}`}
                  />
                  {fieldErrors.phone && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.phone}</p>
                  )}
                </div>

                <div className="mt-3">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Address</label>
                  <input
                    type="text"
                    required
                    value={shippingInfo.address}
                    onChange={(e) => {
                      setShippingInfo({ ...shippingInfo, address: e.target.value });
                      if (fieldErrors.address) {
                        const error = validateField('address', e.target.value);
                        setFieldErrors({ ...fieldErrors, address: error });
                      }
                    }}
                    onBlur={(e) => {
                      const error = validateField('address', e.target.value);
                      setFieldErrors({ ...fieldErrors, address: error });
                    }}
                    className={`input-field ${fieldErrors.address ? 'border-destructive' : ''}`}
                  />
                  {fieldErrors.address && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">City</label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.city}
                      onChange={(e) => {
                        setShippingInfo({ ...shippingInfo, city: e.target.value });
                        if (fieldErrors.city) {
                          const error = validateField('city', e.target.value);
                          setFieldErrors({ ...fieldErrors, city: error });
                        }
                      }}
                      onBlur={(e) => {
                        const error = validateField('city', e.target.value);
                        setFieldErrors({ ...fieldErrors, city: error });
                      }}
                      className={`input-field ${fieldErrors.city ? 'border-destructive' : ''}`}
                    />
                    {fieldErrors.city && (
                      <p className="text-xs text-destructive mt-1">{fieldErrors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.postalCode}
                      onChange={(e) => {
                        setShippingInfo({ ...shippingInfo, postalCode: e.target.value });
                        if (fieldErrors.postalCode) {
                          const error = validateField('postalCode', e.target.value);
                          setFieldErrors({ ...fieldErrors, postalCode: error });
                        }
                      }}
                      onBlur={(e) => {
                        const error = validateField('postalCode', e.target.value);
                        setFieldErrors({ ...fieldErrors, postalCode: error });
                      }}
                      className={`input-field ${fieldErrors.postalCode ? 'border-destructive' : ''}`}
                    />
                    {fieldErrors.postalCode && (
                      <p className="text-xs text-destructive mt-1">{fieldErrors.postalCode}</p>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Country</label>
                  <input
                    type="text"
                    required
                    value={shippingInfo.country}
                    onChange={(e) => {
                      setShippingInfo({ ...shippingInfo, country: e.target.value });
                      if (fieldErrors.country) {
                        const error = validateField('country', e.target.value);
                        setFieldErrors({ ...fieldErrors, country: error });
                      }
                    }}
                    onBlur={(e) => {
                      const error = validateField('country', e.target.value);
                      setFieldErrors({ ...fieldErrors, country: error });
                    }}
                    className={`input-field ${fieldErrors.country ? 'border-destructive' : ''}`}
                  />
                  {fieldErrors.country && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.country}</p>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-card rounded-2xl p-5 border border-border/50">
                <h3 className="font-display font-bold mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">Rs. {subtotal.toLocaleString()}</span>
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
                    Place Order - Rs. {total.toLocaleString()}
                  </>
                )}
              </motion.button>
            </motion.form>
      </div>

      <MobileNav />
    </div>
  );
};

export default Checkout;
