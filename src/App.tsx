import { BrowserRouter, Routes, Route } from 'react-router-dom';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>tixly</div>} />
        {/* Later tasks add routes here */}
      </Routes>
    </BrowserRouter>
  );
}
