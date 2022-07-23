import {
  runOnJS,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import type {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollViewProps,
} from 'react-native';
import { mergeRefs } from './mergeRefs';
import { Platform } from 'react-native';

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

export function useScrollableProps({ onScroll }: ScrollViewProps, ref: any) {
  const scrollableRef = useAnimatedRef<any>();
  const scrollX = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((e) => {
    const { x, y } = e.contentOffset;
    scrollX.value = x;
    scrollY.value = y;

    if (onScroll) {
      // https://github.com/software-mansion/react-native-reanimated/issues/2426
      if (Platform.OS === 'web') {
        onScroll({ nativeEvent: e } as any);
      } else {
        runOnJS(onScroll)({ nativeEvent: e } as any);
      }
    }
  });
  const scrollableProps: AutocompleteScrollableProps = {
    ref: mergeRefs([scrollableRef, ref]),
    scrollEventThrottle: 16,
    keyboardShouldPersistTaps: 'handled',
    onScroll: scrollHandler,
  };
  return { scrollableRef, scrollX, scrollY, scrollableProps };
}
