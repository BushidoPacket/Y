//Checks the character count and handles the counter
//Inputs: event, setter for char count, maximum character count
export default function HandleCharCount(event, setCharCount, maximum) {

        const text = event.target.value;
        setCharCount(text.length);
    
        if (text.length > maximum) {
          event.target.value = text.slice(0, maximum);
          setCharCount(maximum);
        }

  return null;
}
