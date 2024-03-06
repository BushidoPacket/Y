import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import RootLayout from "./routes/RootLayout";
import PageNotFound from "./routes/PageNotFound";
import Profile from './routes/Profile';
import Feed from './routes/Feed';
import Search from './routes/Search';

import './index.css';


const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <PageNotFound />,
    children: [
      { path: "/", element: <Feed /> },
      { path: "/profile", element: <Profile /> },
      { path: "/search", element: <Search /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>,
)
