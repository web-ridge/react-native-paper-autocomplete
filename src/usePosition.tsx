import * as React from 'react';
import { useLayoutEffect } from 'react';
import Animated, {
  SharedValue,
  useDerivedValue,
  useSharedValue,
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
  const [initial] = React.useState(
    getXYFromRef(inputContainerRef, { scrollX, scrollY })
  );
  const x = useSharedValue(initial.x);
  const y = useSharedValue(initial.y);

  useLayoutEffect(() => {
    const coordinates = getXYFromRef(inputContainerRef, { scrollX, scrollY });
    x.value = coordinates.x;
    y.value = coordinates.y;
  });

  return useDerivedValue(() => {
    return {
      x: x.value,
      y: y.value,
    };
  }, [x, y]);
}

function getXYFromRef(
  ref: React.RefObject<Animated.View>,
  {
    scrollX,
    scrollY,
  }: {
    scrollX: SharedValue<number>;
    scrollY: SharedValue<number>;
  }
) {
  const { x, y } = getBoundingClientRect(ref.current as any);
  return {
    x: x + scrollX.value + (window?.scrollX || 0),
    y: y + scrollY.value + (window?.scrollY || 0),
  };
}

function getBoundingClientRect(node: HTMLElement) {
  if (node) {
    const isElement = node.nodeType === 1; /* Node.ELEMENT_NODE */
    if (isElement && typeof node.getBoundingClientRect === 'function') {
      return node.getBoundingClientRect();
    }
  }
  return { x: 0, y: 0 };
}
