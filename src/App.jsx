import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Dashboard from './pages/GmatChatbot';
import LandingPage from './pages/LandingPage';

import { getAuth, onAuthStateChanged } from 'firebase/auth';
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });
  
    return () => {
      unsubscribe();
    };
  }, [auth]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                redirectPath="/"
              />
            }
          >
            <Route
              path="/home"
              element={
                  <Dashboard />
              }
            />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
