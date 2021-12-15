import * as React from 'react';
import { StyleSheet, Animated, View } from 'react-native';
import { DarkTheme, Surface } from 'react-native-paper';
import type { AnimatedComponentDimensions } from './useComponentDimensions';
import usePosition from './usePosition';

export default function PositionedSurface({
  inputContainerRef,
  children,
  theme,
  dropdownWidth,
  inputContainerDimensions,
  scrollX,
  scrollY,
  animatedScrollX,
  animatedScrollY,
}: {
  scrollX: React.MutableRefObject<number>;
  scrollY: React.MutableRefObject<number>;
  animatedScrollX: React.MutableRefObject<Animated.Value>;
  animatedScrollY: React.MutableRefObject<Animated.Value>;
  inputContainerRef: React.MutableRefObject<View | null>;
  children: any;
  theme: typeof DarkTheme;
  dropdownWidth: number;
  inputContainerDimensions: AnimatedComponentDimensions;
}) {
  const position = usePosition({ inputContainerRef, scrollX, scrollY });

  return (
    <Surface
      style={[
        StyleSheet.absoluteFill,
        styles.surface,
        {
          transform: [
            {
              translateY: Animated.subtract(
                Animated.add(position.y, inputContainerDimensions.height),
                animatedScrollY.current
              ),
            },
            {
              translateX: Animated.subtract(
                position.x,
                animatedScrollX.current
              ),
            },
          ],
          // transitionProperty: 'all',
          // transitionTimingFunction: 'linear',
          // transitionDuration: '10ms',
          width: dropdownWidth,
          borderRadius: theme.roundness,
          // TODO: add support for scroll position top/bottom
          // maxHeight:
          //   window.height -
          //   (inputLayoutLazy.y + inputLayoutLazy.height),
        },
      ]}
    >
      {children}
    </Surface>
  );
}

const styles = StyleSheet.create({
  surface: { zIndex: 100 },
});
