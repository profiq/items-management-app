import './App.css';

import { BrowserRouter, Route, Routes } from 'react-router';
import './index.css';
import { NavigationMenuReference } from './components/navigation-menu-reference.tsx';
import Home from './routes/Home.tsx';
import { AuthProvider } from './lib/providers/auth/AuthProvider.tsx';
import Login from './routes/Login.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import AdminRoute from './components/AdminRoute.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Employees from './routes/Employees.tsx';
import { Toaster } from '@/components/ui/sonner';
import Profile from './routes/Profile.tsx';
import Admin from './routes/admin/Admin.tsx';
import AdminItems from './routes/admin/Items.tsx';
import AdminCategories from './routes/admin/Categories.tsx';
import AdminLocations from './routes/admin/Locations.tsx';

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <div className='profiq'>
              <NavigationMenuReference />
              <div id='content'>
                <Routes>
                  <Route path='/' element={<Home />} />
                  <Route path='/login' element={<Login />} />
                  <Route element={<ProtectedRoute />}>
                    <Route path='/profile' element={<Profile />} />
                    <Route path='/employees' element={<Employees />} />
                  </Route>
                  <Route element={<AdminRoute />}>
                    <Route path='/admin' element={<Admin />} />
                    <Route path='/admin/items' element={<AdminItems />} />
                    <Route
                      path='/admin/categories'
                      element={<AdminCategories />}
                    />
                    <Route
                      path='/admin/locations'
                      element={<AdminLocations />}
                    />
                  </Route>
                </Routes>
              </div>
              <Toaster />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
