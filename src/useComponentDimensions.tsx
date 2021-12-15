import * as React from 'react';
import { Animated, LayoutChangeEvent } from 'react-native';

export type ComponentDimensions = {
  width: number;
  height: number;
};

export type AnimatedComponentDimensions = {
  width: Animated.Value;
  height: Animated.Value;
};

export default function useComponentDimensions() {
  const animatedDimensions = React.useRef<AnimatedComponentDimensions>({
    width: new Animated.Value(0),
    height: new Animated.Value(0),
  });

  const [dimensions, setDimensions] = React.useState<ComponentDimensions>({
    width: 0,
    height: 0,
  });

  return {
    updateLayout: Animated.event(
      [
        {
          nativeEvent: {
            layout: {
              width: animatedDimensions.current.width,
              height: animatedDimensions.current.height,
            },
          },
        },
      ],
      {
        useNativeDriver: true,
        listener: (event: LayoutChangeEvent) => {
          const { layout } = event.nativeEvent;
          setDimensions({
            width: layout.width,
            height: layout.height,
          });
        },
      }
    ),
    dimensions,
    animatedDimensions,
  };
}
