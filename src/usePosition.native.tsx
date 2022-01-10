import type * as React from 'react';
import Animated, {
  measure,
  useAnimatedReaction,
  SharedValue,
  useSharedValue,
  useDerivedValue,
} from 'react-native-reanimated';

export default function usePosition({
  inputContainerRef,
  scrollX,
  scrollY,
}: {
  scrollX: SharedValue<number>;
  scrollY: SharedValue<number>;
  inputContainerRef: React.RefObject<Animated.View>;
}) {
  const measuredValue = useSharedValue<{
    width: number;
    height: number;
    x: number;
    y: number;
    pageX: number;
    pageY: number;
  }>({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    pageX: 0,
    pageY: 0,
  });

  // TODO: make this simple with measure function directly in useDerivedValue
  // https://github.com/software-mansion/react-native-reanimated/issues/2779
  useAnimatedReaction(
    () => {
      return measure(inputContainerRef);
    },
    (measured) => {
      measuredValue.value = {
        ...measured,
        pageY: measured.pageY + scrollY.value,
        pageX: measured.pageX + scrollX.value,
      };
    }
  );
  return useDerivedValue(() => {
    return {
      x: measuredValue.value.pageX + measuredValue.value.x,
      y: measuredValue.value.pageY + measuredValue.value.y,
    };
  }, [measuredValue, scrollX, scrollY]);
}
