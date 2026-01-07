import './App.css';

import { BrowserRouter, Route, Routes } from 'react-router';
import './index.css';
import About from './routes/About.tsx';
import Contact from './routes/Contact.tsx';
import { NavigationMenuReference } from './components/navigation-menu-reference.tsx';
import Home from './routes/Home.tsx';

function App() {
  return (
    <>
      <BrowserRouter>
        <NavigationMenuReference></NavigationMenuReference>
        <div id='content'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
          </Routes>
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
