import { Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

//Root layout for all pages, includes NavBar and Footer
//All pages are rendered inside the Outlet component
//Main control buttons should be handled on the NavBar component to be available everywhere
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
