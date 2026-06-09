import './App.css';

import { BrowserRouter, Route, Routes } from 'react-router';
import './index.css';
import { AppLayout } from './components/AppLayout.tsx';
import Home from './routes/Home.tsx';
import { AuthProvider } from './lib/providers/auth/AuthProvider.tsx';
import { ThemeProvider } from './lib/providers/theme/ThemeProvider.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import AdminRoute from './components/AdminRoute.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Employees from './routes/Employees.tsx';
import { Toaster } from 'sonner';
import Dashboard from './routes/dashboard/Dashboard.tsx';
import Loans from './routes/loans/Loans.tsx';
import Admin from './routes/admin/Admin.tsx';
import AdminItems from './routes/admin/Items.tsx';
import AdminCategories from './routes/admin/Categories.tsx';
import AdminLocations from './routes/admin/Locations.tsx';
import AdminLoans from './routes/admin/Loans.tsx';
import AdminTags from './routes/admin/Tags.tsx';

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <div className='min-h-svh'>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path='/' element={<Home />} />
                  <Route element={<ProtectedRoute />}>
                    <Route path='/dashboard' element={<Dashboard />} />
                    <Route path='/loans' element={<Loans />} />
                  </Route>
                  <Route element={<AdminRoute />}>
                    <Route path='/employees' element={<Employees />} />
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
                    <Route path='/admin/loans' element={<AdminLoans />} />
                    <Route path='/admin/tags' element={<AdminTags />} />
                  </Route>
                </Route>
              </Routes>
              <Toaster />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
