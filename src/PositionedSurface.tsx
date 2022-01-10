import * as React from 'react';
import { StyleSheet, Platform } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  FadeInDown,
} from 'react-native-reanimated';
import usePosition from './usePosition';
import AnimatedSurface from './AnimatedSurface';
import type { DarkTheme } from 'react-native-paper';

export default function PositionedSurface({
  // scrollViewRef,
  inputContainerRef,
  children,
  theme,
  dropdownWidth,
  inputContainerHeight,
  scrollX,
  scrollY,
}: {
  scrollViewRef: React.RefObject<Animated.ScrollView>;
  inputContainerRef: React.RefObject<Animated.View>;
  scrollX: SharedValue<number>;
  scrollY: SharedValue<number>;

  dropdownWidth: SharedValue<number>;
  inputContainerHeight: SharedValue<number>;
  children: any;
  theme: typeof DarkTheme;
}) {
  console.log('positioned surface re-render');
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

  // React.useEffect(() => {
  //   scrollViewRef.current?.scrollTo({ x: 0, y: position.y, animated: false });
  // }, [position.y]);
  const isWeb = Platform.OS === 'web';

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

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.surface, animatedStyle]}
      pointerEvents="box-none"
    >
      <AnimatedSurface
        entering={FadeInDown}
        elevation={5}
        style={[
          {
            width: dropdownWidth.value,
            borderRadius: theme.roundness,
            maxHeight: 200,
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
