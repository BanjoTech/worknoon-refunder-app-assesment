import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from 'react-router-dom';
import CustomerPage from './pages/CustomerPage';
import AdminPage from './pages/AdminPage';

function App() {
  // Initialize theme from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('worknoon_theme') || 'light';
  });

  // Apply data-theme attribute to the root html element whenever theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('worknoon_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <Router>
      <nav className='navbar'>
        <div className='nav-brand'>
          <h1>Worknoon</h1>
          <span className='brand-badge'>Refund AI</span>
        </div>
        <div className='nav-actions'>
          <div className='nav-links'>
            <NavLink
              to='/'
              end
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              Customer Portal
            </NavLink>
          </div>
          {/* Theme Toggle Button */}
          <button
            type='button'
            className='theme-toggle-btn'
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </nav>
      <main className='container'>
        <Routes>
          <Route path='/' element={<CustomerPage />} />
          <Route path='/admin' element={<AdminPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
