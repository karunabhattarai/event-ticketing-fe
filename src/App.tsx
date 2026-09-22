import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { EventListingPage } from './pages/public/EventListingPage';
import { EventDetailPage } from './pages/public/EventDetailPage';
import { CartProvider } from './context/CartContext';
import { CheckoutPage } from './pages/public/CheckoutPage';

export function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<EventListingPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          {/* Later tasks add routes here */}
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
