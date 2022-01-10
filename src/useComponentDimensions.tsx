import * as React from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';
import type { LayoutChangeEvent } from 'react-native';

export type AnimatedComponentDimensions = {
  width: SharedValue<number>;
  height: SharedValue<number>;
};

export default function useComponentDimensions() {
  const width = useSharedValue(0);
  const height = useSharedValue(0);

  const onLayout = React.useCallback(
    (e: LayoutChangeEvent) => {
      const layout = e.nativeEvent.layout;

      width.value = layout.width;
      height.value = layout.height;
      //
      // return Animated.event(
      //   [
      //     {
      //       nativeEvent: {
      //         layout: {
      //           width,
      //           height,
      //         },
      //       },
      //     },
      //   ],
      //   {
      //     useNativeDriver: true,
      //   }
      // );
    },
    [width, height]
  );
  // console.log('useComponentDimensions', dimensions);
  return {
    onLayout,
    width,
    height,
  };
}
