import { useEffect } from "react";

function AppTitle({ title }) {
    useEffect(() => {
        document.title = title || "Y social media";
    }, [title]);

    return null; //Because there is no need to render anything
}

export default AppTitle;