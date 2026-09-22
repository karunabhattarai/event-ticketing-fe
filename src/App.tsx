import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import { EventListingPage } from './pages/public/EventListingPage';
import { EventDetailPage } from './pages/public/EventDetailPage';
import { CartProvider } from './context/CartContext';
import { CheckoutPage } from './pages/public/CheckoutPage';
import { RedirectPaymentPage } from './pages/public/RedirectPaymentPage';
import { DynamicQrPaymentPage } from './pages/public/DynamicQrPaymentPage'; // added in Task 7
import { OrderConfirmationPage } from './pages/public/OrderConfirmationPage';
import { OrderStatusPage } from './pages/public/OrderStatusPage';
import { BuyerLoginPage } from './pages/public/BuyerLoginPage';
import { BuyerRegisterPage } from './pages/public/BuyerRegisterPage';
import { MyOrdersPage } from './pages/public/MyOrdersPage';

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
          <Route path="/order/:orderId/confirmation" element={<OrderConfirmationPage />} />
          <Route path="/order/:orderId/status" element={<OrderStatusPage />} />
          <Route path="/login" element={<BuyerLoginPage />} />
          <Route path="/register" element={<BuyerRegisterPage />} />
          <Route path="/account/orders" element={<MyOrdersPage />} />
          {/* Later tasks add routes here */}
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
