import { useEffect } from "react";

//Custom hook to set the title of the page
function AppTitle({ title }) {
    useEffect(() => {
        document.title = title || "Y social media";
    }, [title]);

    return null;
}

export default AppTitle;