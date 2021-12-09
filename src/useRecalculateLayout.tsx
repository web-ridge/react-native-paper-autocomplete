import useLatest from './useLatest';
import * as React from 'react';
import type { LayoutRectangle, View } from 'react-native';
import type { MutableRefObject, Dispatch, SetStateAction } from 'react';

export default function useRecalculateLayout({
  inputLayout,
  inputContainerRef,
  setInputLayout,
}: {
  inputLayout: LayoutRectangle;
  inputContainerRef: MutableRefObject<View | null>;
  setInputLayout: Dispatch<SetStateAction<LayoutRectangle>>;
}) {
  const inputLayoutRef = useLatest(inputLayout);
  const recalculateLayout = React.useCallback(() => {
    if (!inputContainerRef.current) {
      return;
    }

    inputContainerRef.current.measureInWindow(
      (x: number, y: number, width: number, height: number) => {
        const old = inputLayoutRef.current;

        if (
          old.x !== x ||
          old.y !== y ||
          old.width !== width ||
          old.height !== height
        ) {
          setInputLayout({
            x,
            y,
            width,
            height,
          });
        }
      }
    );
  }, [setInputLayout, inputLayoutRef, inputContainerRef]);

  // update left/top of textinput
  React.useEffect(() => {
    recalculateLayout();
  });
}
