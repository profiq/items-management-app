import './App.css';

import { BrowserRouter, Route, Routes } from 'react-router';
import './index.css';
import About from './routes/About.tsx';
import Contact from './routes/Contact.tsx';
import { NavigationMenuReference } from './components/navigation-menu-reference.tsx';
import Home from './routes/Home.tsx';
import { AuthProvider } from './lib/providers/auth/AuthProvider.tsx';
import Login from './routes/Login.tsx';
import Protected from './routes/Protected.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <NavigationMenuReference></NavigationMenuReference>
          <div id='content'>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/about' element={<About />} />
              <Route path='/contact' element={<Contact />} />
              <Route path='/login' element={<Login />} />
              <Route element={<ProtectedRoute />}>
                <Route path='/protected' element={<Protected />} />
              </Route>
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
