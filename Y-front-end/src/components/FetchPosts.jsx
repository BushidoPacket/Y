import { useEffect } from 'react';
import API from './Addressables.jsx';

//Fetch posts from the API with pagination
export default function FetchPosts({ setLoading, setPosts, page, params = {} }) {


    useEffect(() => {
        async function fetchPosts() {

          const query = {};
    
          if(params.author) {
            query.author = params.author;
          }

          if(params.text) {
            query.text = params.text;
          }

          setLoading(true);
          const response = await fetch(`${API}/posts?page=${page}&author=${query.author}&text=${query.text}`);

          if(response.status !== 200) {
            const error = await response.json();
            alert(error.error);
            setLoading(false);
            return;
          }

          const data = await response.json();
          setPosts((prevPosts) => [...prevPosts, ...data]);
          setLoading(false);
        }
        fetchPosts();
      }, [page]);


  return null;
}
