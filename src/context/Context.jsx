import { createContext, useState } from "react";
import run, { retryWithDelay } from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
    const [input, setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState("");
    const [prevPrompts, setPrevPrompts] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode); 
    };

    const delayPara = (index, nextWord) => {
        setTimeout(() => {
            setResultData((prev) => prev + nextWord);
        }, 75 * index);
    };

    const newChat = () => {
        setLoading(false);
        setShowResult(false);
    };

    const onSent = async (prompt) => {
        setResultData("");
        setLoading(true);
        setShowResult(true);

        try {
            let result;
            if (prompt) {
                result = await retryWithDelay(() => run(prompt), 3, 2000);
                setRecentPrompt(prompt);
            } else {
                setPrevPrompts((prev) => [...prev, input]);
                setRecentPrompt(input);
                result = await retryWithDelay(() => run(input), 3, 2000);
            }

            let resultArray = result.split("**");
            let newResult = "";
            for (let i = 0; i < resultArray.length; i++) {
                if (i === 0 || i % 2 !== 1) {
                    newResult += resultArray[i];
                } else {
                    newResult += "<b>" + resultArray[i] + "</b>";
                }
            }
            let newResult2 = newResult.split("*").join("</br>");
            let newResultArray = newResult2.split(" ");
            for (let i = 0; i < newResultArray.length; i++) {
                const nextWord = newResultArray[i];
                delayPara(i, nextWord + " ");
            }
        } catch (error) {
            setResultData("The service is currently unavailable. Please try again later.");
            console.error("Error:", error);
        }

        setLoading(false);
        setInput("");
    };

    const contextValue = {
        prevPrompts,
        setPrevPrompts,
        onSent,
        setRecentPrompt,
        recentPrompt,
        showResult,
        loading,
        resultData,
        input,
        setInput,
        newChat,
        isDarkMode,
        toggleDarkMode,
    };

    return <Context.Provider value={contextValue}>{props.children}</Context.Provider>;
};

export default ContextProvider;
