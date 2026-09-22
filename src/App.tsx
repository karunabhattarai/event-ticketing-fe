import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { EventListingPage } from './pages/public/EventListingPage';
import { EventDetailPage } from './pages/public/EventDetailPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EventListingPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        {/* Later tasks add routes here */}
      </Routes>
    </BrowserRouter>
  );
}
