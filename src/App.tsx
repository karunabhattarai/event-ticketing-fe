import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import { EventListingPage } from './pages/public/EventListingPage';
import { EventDetailPage } from './pages/public/EventDetailPage';
import { CartProvider } from './context/CartContext';
import { CheckoutPage } from './pages/public/CheckoutPage';
import { RedirectPaymentPage } from './pages/public/RedirectPaymentPage';
import { DynamicQrPaymentPage } from './pages/public/DynamicQrPaymentPage'; // added in Task 7

function PaymentPage() {
  const [params] = useSearchParams();
  return params.get('method') === 'dynamic_qr' ? <DynamicQrPaymentPage /> : <RedirectPaymentPage />;
}

export function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<EventListingPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/:orderId/pay" element={<PaymentPage />} />
          {/* Later tasks add routes here */}
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
