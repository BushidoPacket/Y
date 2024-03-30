import { useEffect } from 'react';
import API from './Addressables.jsx';

//Fetch posts from the API with pagination
export default function FetchPosts({ setLoading, setPosts, page }) {

    useEffect(() => {
        async function fetchPosts() {
          setLoading(true);
          const response = await fetch(`${API}/posts?page=${page}`);
          const data = await response.json();
          setPosts((prevPosts) => [...prevPosts, ...data]);
          setLoading(false);
        }
        fetchPosts();
      }, [page]);


  return null;
}
