import * as React from 'react';
import {
  StyleSheet,
  Platform,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  FadeInDown,
} from 'react-native-reanimated';
import usePosition from './usePosition';
import AnimatedSurface from './AnimatedSurface';
import type { DarkTheme } from 'react-native-paper';
import useKeyboardHeight from './useKeyboardHeight';

const SCROLLING_PADDING = 120;

export default function PositionedSurface({
  scrollableRef,
  inputContainerRef,
  children,
  theme,
  dropdownWidth,
  inputContainerHeight,
  scrollX,
  scrollY,
}: {
  scrollableRef: React.RefObject<Animated.ScrollView | Animated.FlatList>;
  inputContainerRef: React.RefObject<Animated.View>;
  scrollX: SharedValue<number>;
  scrollY: SharedValue<number>;

  dropdownWidth: SharedValue<number>;
  inputContainerHeight: SharedValue<number>;
  children: any;
  theme: typeof DarkTheme;
}) {
  const dimensions = useWindowDimensions();
  const keyboardHeight = useKeyboardHeight(dimensions);
  const position = usePosition({
    inputContainerRef,
    scrollX,
    scrollY,
  });

  const translateX = useDerivedValue(
    () => position.value.x - scrollX.value,
    [position, scrollX]
  );

  const translateY = useDerivedValue(
    () => position.value.y + inputContainerHeight.value - scrollY.value,
    [position, inputContainerHeight, scrollY]
  );
  const isWeb = Platform.OS === 'web';

  React.useLayoutEffect(() => {
    if (isWeb) {
      return;
    }

    const timerId = setTimeout(() => {
      if (scrollableRef.current) {
        (scrollableRef.current as any as ScrollView).scrollTo({
          x: position.value.x, // - TODO: inputContainer.width?
          y: position.value.y - SCROLLING_PADDING,
          animated: true,
        });
      }
    }, 100);
    return () => clearTimeout(timerId);
  }, [position.value, isWeb, scrollableRef]);

  const animatedStyle = useAnimatedStyle(() => {
    if (isWeb) {
      return {
        transform: [
          {
            translateY: translateY.value,
          },
          {
            translateX: translateX.value,
          },
        ],
      };
    }
    return {
      // transform is buggy at least on iOS at inital re-render
      top: translateY.value,
      left: translateX.value,
    };
  }, [dropdownWidth, translateX, translateY]);
  const animatedSurfaceStyle = useAnimatedStyle(() => {
    return {
      maxHeight:
        dimensions.height - keyboardHeight.value - SCROLLING_PADDING * 2,
    };
  }, [dimensions.height - keyboardHeight.value]);

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.surface, animatedStyle]}
      pointerEvents="box-none"
    >
      <AnimatedSurface
        entering={FadeInDown}
        elevation={5}
        style={[
          animatedSurfaceStyle,
          {
            width: dropdownWidth.value,
            borderRadius: theme.roundness,
          },
        ]}
      >
        {children}
      </AnimatedSurface>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  surface: { zIndex: 100 },
});
