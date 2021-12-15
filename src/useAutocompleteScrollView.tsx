import * as React from 'react';
import {
  Animated,
  NativeScrollEvent,
  ScrollView,
  ScrollViewProps,
} from 'react-native';

export default function useAutocompleteScrollView() {
  const scrollViewRef = React.useRef<ScrollView>(null);
  const animatedScrollX = React.useRef(new Animated.Value(0));
  const animatedScrollY = React.useRef(new Animated.Value(0));
  const scrollX = React.useRef(0);
  const scrollY = React.useRef(0);

  const scrollViewProps: Pick<
    ScrollViewProps,
    'scrollEventThrottle' | 'keyboardShouldPersistTaps' | 'onScroll'
  > & { ref: any } = {
    ref: scrollViewRef,
    scrollEventThrottle: 16,
    keyboardShouldPersistTaps: 'handled', //??
    onScroll: Animated.event(
      [
        {
          nativeEvent: {
            contentOffset: {
              x: animatedScrollX.current,
              y: animatedScrollY.current,
            },
          },
        },
      ],
      {
        useNativeDriver: true,
        listener: (e) => {
          const nativeEvent = e.nativeEvent as any as NativeScrollEvent;
          // console.log('listener', nativeEvent.contentOffset);
          scrollX.current = nativeEvent.contentOffset.x;
          scrollY.current = nativeEvent.contentOffset.y;
        },
      }
    ),
  };
  return {
    autoCompleteProps: {
      scrollViewRef,
      animatedScrollX,
      animatedScrollY,
      scrollX,
      scrollY,
    },
    scrollViewProps,
  };
}
