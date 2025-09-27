import React from 'react';
import './App.css';
import Header from './components/HeaderComponent/Header';
import Footer from './components/FooterComponent/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { routes } from './routes';


function App() {
  return (
    <div className="App">
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
    </div>
  );
}

export default App;
