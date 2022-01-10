import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { AutocompleteContext } from './AutocompleteContext';
import type { ScrollViewProps } from 'react-native';
import * as React from 'react';

function AutocompleteScrollView({ ...rest }: ScrollViewProps) {
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((e) => {
    const { x, y } = e.contentOffset;
    scrollX.value = x;
    scrollY.value = y;
  });
  const scrollViewProps: Pick<
    ScrollViewProps,
    'scrollEventThrottle' | 'keyboardShouldPersistTaps' | 'onScroll'
  > & { ref: any } = {
    ref: scrollViewRef,
    scrollEventThrottle: 16,
    keyboardShouldPersistTaps: 'handled',
    onScroll: scrollHandler,
  };
  return (
    <AutocompleteContext.Provider value={{ scrollViewRef, scrollX, scrollY }}>
      <Animated.ScrollView {...rest} {...scrollViewProps} />
    </AutocompleteContext.Provider>
  );
}
export default AutocompleteScrollView;
