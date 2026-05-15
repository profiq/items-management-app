import './App.css';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import './index.css';
import { NavigationMenuReference } from './components/navigation-menu-reference.tsx';
import { AuthProvider } from './lib/providers/auth/AuthProvider.tsx';
import Home from './routes/Home.tsx';
import Login from './routes/Login.tsx';
import AdminRoute from './components/AdminRoute.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@profiq/ui/components/ui/feedback';
import VersionInfo from './components/version-info.tsx';
import Admin from './routes/admin/Admin.tsx';

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <NavigationMenuReference></NavigationMenuReference>
            <div id='content'>
              <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/login' element={<Login />} />
                <Route element={<AdminRoute />}>
                  <Route path='/admin' element={<Admin />} />
                </Route>
                <Route path='*' element={<Navigate to='/login' replace />} />
              </Routes>
            </div>
            <VersionInfo />
            <Toaster />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
