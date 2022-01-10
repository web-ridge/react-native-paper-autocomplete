import * as React from 'react';
import { Keyboard, KeyboardEvent } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

function useKeyboardHeight(_: { width: number; height: number }) {
  const keyboardHeight = useSharedValue(0);
  React.useEffect(() => {
    const keyboardDidShow = (frames: KeyboardEvent) => {
      keyboardHeight.value = frames.endCoordinates.height;
    };

    const keyboardDidHide = () => {
      keyboardHeight.value = 0;
    };
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      keyboardDidShow
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      keyboardDidHide
    );

    // cleanup function
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [keyboardHeight]);

  return keyboardHeight;
}

export default useKeyboardHeight;
