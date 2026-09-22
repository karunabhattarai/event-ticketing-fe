import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { EventListingPage } from './pages/public/EventListingPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EventListingPage />} />
        {/* Later tasks add routes here */}
      </Routes>
    </BrowserRouter>
  );
}
