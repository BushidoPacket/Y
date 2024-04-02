
export default function CheckOwnership({ user }) {
  
    const username = localStorage.getItem("username");

    if (user === username) {
        return true;
    } else {
        return false;
    }

}
