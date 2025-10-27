import React from 'react';
import './App.css';
import Header from './components/HeaderComponent/Header';
import Footer from './components/FooterComponent/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { routes } from './routes';
import { CartProvider } from './contexts/CartContext';
import { QueryClientProvider, queryClient } from './config/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <CartProvider>
          <Router>
            <Routes>
              {routes.map((route, index) => (
                <Route
                  key={index}
                  path={route.path} // đảm bảo '/admin/*' trong routes/index.js
                  element={
                    <div className="app-layout">
                      {route.isShowHeader !== false && <Header toggleSidebar={() => {}} />}
                      <main className="main-content">
                        <route.component />
                      </main>
                      {route.isShowHeader !== false && <Footer />}
                    </div>
                  }
                />
              ))}
            </Routes>
            
          </Router>
        </CartProvider>
      </div>
      
    </QueryClientProvider>
  );
}

export default App;
