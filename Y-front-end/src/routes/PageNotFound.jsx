import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

function PageNotFound() {
  return (
    <>
      <NavBar />
      <div>
        <h1>404: Page not found</h1>
        <img src="https://media1.tenor.com/m/FcVg5W9zZJQAAAAC/error.gif" />
      </div>
      <Footer />
    </>
  );
}

export default PageNotFound;
