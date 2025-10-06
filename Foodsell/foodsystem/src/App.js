import React from 'react';
import './App.css';
import Header from './components/HeaderComponent/Header';
import Footer from './components/FooterComponent/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { routes } from './routes';
import { CartProvider } from './contexts/CartContext';
import { QueryClientProvider, ReactQueryDevtools, queryClient } from './config/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <CartProvider>
          <Router>
            <Header toggleSidebar={() => {}} />
            <main className="main-content">
              <Routes>
                {routes.map((route, index) => (
                  <Route key={index} path={route.path} element={<route.component />} />
                ))}
              </Routes>
            </main>
            <Footer/> 
          </Router>
        </CartProvider>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
