import { Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

function RootLayout() {
  
  return (
    <> 
      <NavBar />
      <Outlet />
      <Footer />
    </>
  );
}

export default RootLayout;
