import './App.css';

import { BrowserRouter, Route, Routes } from 'react-router';
import './index.css';
import About from './routes/About.tsx';
import { NavigationMenuReference } from './components/navigation-menu-reference.tsx';
import Home from './routes/Home.tsx';
import { AuthProvider } from './lib/providers/auth/AuthProvider.tsx';
import Login from './routes/Login.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Employees from './routes/Employees.tsx';
import PetList from './routes/PetList.tsx';
import PetCreate from './routes/PetCreate.tsx';
import PetUpdate from './routes/PetUpdate.tsx';
import PetDetailPage from './routes/PetDetail.tsx';
import PetDeletePage from './routes/PetDelete.tsx';
import { Toaster } from './components/ui/sonner.tsx';
import Profile from './routes/Profile.tsx';

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
                <Route path='/about' element={<About />} />
                <Route path='/login' element={<Login />} />
                <Route element={<ProtectedRoute />}>
                  <Route path='/profile' element={<Profile />} />
                  <Route path='/employees' element={<Employees />} />
                  <Route path='/pets' element={<PetList />} />
                  <Route path='/pets/:id' element={<PetDetailPage />} />
                  <Route path='/create-pet' element={<PetCreate />} />
                  <Route path='/pets/:id/update' element={<PetUpdate />} />
                  <Route path='/pets/:id/delete' element={<PetDeletePage />} />
                </Route>
              </Routes>
            </div>
            <Toaster />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
