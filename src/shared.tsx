import {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export type AutocompleteScrollableProps = {
  ref?: any;
  scrollEventThrottle?: number | undefined; // null
  keyboardShouldPersistTaps?:
    | boolean
    | 'always'
    | 'never'
    | 'handled'
    | undefined;
  onScroll?:
    | ((event: NativeSyntheticEvent<NativeScrollEvent>) => void)
    | undefined;
};

export function useScrollableProps() {
  const scrollableRef = useAnimatedRef<any>();
  const scrollX = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((e) => {
    const { x, y } = e.contentOffset;
    scrollX.value = x;
    scrollY.value = y;
  });
  const scrollableProps: AutocompleteScrollableProps = {
    ref: scrollableRef,
    scrollEventThrottle: 16,
    keyboardShouldPersistTaps: 'handled',
    onScroll: scrollHandler,
  };
  return { scrollableRef, scrollX, scrollY, scrollableProps };
}
