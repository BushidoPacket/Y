//Check if the user is the owner of the item based on stored name
//Just for the front-end solution, all such checks are done on the back-end
export default function CheckOwnership({ user }) {
  
    const username = localStorage.getItem("username");

    if (user === username) {
        return true;
    } else {
        return false;
    }

}
