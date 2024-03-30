import API from './Addressables';

//Post new post to the DB
export default async function PostNewPost({text, TOKEN, setPosts}) {

        if (text === "" || text === null || text === undefined || text.length < 2) {
          alert("Your post is too short, minimum length is 2 characters.");
          return;
        }
    
        const response = await fetch(`${API}/posts/new`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: TOKEN,
          },
          body: JSON.stringify({ text }),
        });
    
        if (response.status === 201) {
          const newPost = await response.json();
          setPosts((prevPosts) => [newPost, ...prevPosts]);
          document.getElementById("contentInput").value = "";
        } else {
          const output = await response.json();
          alert(output.error);
        }

  return null;

}
