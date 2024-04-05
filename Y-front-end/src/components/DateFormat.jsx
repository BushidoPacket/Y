//Takes timestamp as argument and returns formatted date and time
export default function DateFormat({timestamp}) {

        const date = new Date(timestamp * 1);
        const formattedDate = date.toLocaleString("cs-CZ", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });
    
        const formattedTime = date.toLocaleString("cs-CZ", {
          hour: "2-digit",
          minute: "2-digit",
        });
    
        const nbsp = "\u00A0";
        const separator = nbsp + " | " + nbsp;
    
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
    
        if (
          formattedDate ===
          today.toLocaleString("cs-CZ", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })
        ) {
          return `${formattedTime}${separator}Today`;
        } else if (
          formattedDate ===
          yesterday.toLocaleString("cs-CZ", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })
        ) {
          return `${formattedTime}${separator}Yesterday`;
        } else {
          return `${formattedTime}${separator}${formattedDate}`;
        }

}
