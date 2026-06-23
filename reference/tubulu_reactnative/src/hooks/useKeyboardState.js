import {useEffect, useState} from "react";
import {Keyboard} from "react-native";

const useKeyboardState = () => {
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setIsKeyboardOpen(true);
        })

        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setIsKeyboardOpen(false);
        })

    }, []);

    return isKeyboardOpen;
}

export default useKeyboardState;
