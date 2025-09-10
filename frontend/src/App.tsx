import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import Companies from "./pages/Companies";
import UserProfile from "./pages/UserProfile";
import WriteReview from "./pages/WriteReview";
import WriteReviewModal from './pages/WriteReview';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/write-review" element={<WriteReview isOpen={false} onClose={function (): void {
          throw new Error('Function not implemented.');
        } } user={null}/>} />
      </Routes>
    </Router>
  );
}

export default App;