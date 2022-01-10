import * as React from 'react';
import { useSharedValue } from 'react-native-reanimated';

function useKeyboardHeight(dimensions: { width: number; height: number }) {
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  // If it's a touch device we conclude that half of the screen will be used by virtual keyboard
  const keyboardHeight = useSharedValue(
    isTouchDevice ? dimensions.height / 2 : 0
  );

  React.useEffect(() => {
    // is this api is implemented yet, otherwise we fallback on behaviour above
    const virtualKeyboard = (navigator as any).virtualKeyboard;
    if (virtualKeyboard) {
      const handler = (event: any) => {
        const { height } = event.target;
        keyboardHeight.value = height;
      };
      virtualKeyboard.addEventListener('geometrychanged', handler);
      return () => {
        virtualKeyboard.removeEventListener('geometrychanged', handler);
      };
    }
    return undefined;
  }, [keyboardHeight]);
  return keyboardHeight;
}

export default useKeyboardHeight;
