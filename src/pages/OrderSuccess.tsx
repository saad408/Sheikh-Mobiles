import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, Phone } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { useCartStore } from '@/store/cartStore';

const PHONE_NUMBER = '+92 317 1519605';
const PHONE_LINK = 'tel:+923171519605';

const OrderSuccess = () => {
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="page-transition">
      <Header title="Order placed" showBack />

      <div className="container-mobile pt-6 pb-32 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center text-center"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-3">
            Your order has been successfully placed
          </h1>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Sheikh Mobiles will call you in a while to confirm and arrange delivery.
          </p>

          <div className="w-full max-w-md rounded-2xl border border-border bg-muted/30 p-5 text-left space-y-4 mb-8">
            <p className="text-sm text-foreground font-medium">
              Please note: you will need to pay <span className="font-bold text-primary">Rs. 1,000</span> as shipping charges (before delivery).
            </p>
            <p className="text-sm text-muted-foreground">
              You can also call us at{' '}
              <a
                href={PHONE_LINK}
                className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline [&>svg]:shrink-0"
                style={{ verticalAlign: 'middle' }}
              >
                <Phone className="w-4 h-4" style={{ verticalAlign: 'middle' }} />
                {PHONE_NUMBER}
              </a>
              {' '}for any queries.
            </p>
          </div>

          <Link to="/" className="btn-accent">
            Continue shopping
          </Link>
        </motion.div>
      </div>

      <MobileNav />
    </div>
  );
};

export default OrderSuccess;
