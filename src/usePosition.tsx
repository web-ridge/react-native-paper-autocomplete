import * as React from 'react';
import { Animated, View } from 'react-native';
import { useLayoutEffect } from 'react';

export default function usePosition({
  inputContainerRef,
  scrollX,
  scrollY,
}: {
  scrollX: React.MutableRefObject<number>;
  scrollY: React.MutableRefObject<number>;
  inputContainerRef: React.MutableRefObject<View | null>;
}) {
  const position = React.useRef(
    new Animated.ValueXY(getXYFromRef(inputContainerRef, { scrollX, scrollY }))
  );

  useLayoutEffect(() => {
    position.current.setValue(
      getXYFromRef(inputContainerRef, { scrollX, scrollY })
    );
  });

  return position.current;
}

function getXYFromRef(
  ref: React.MutableRefObject<View | null>,
  {
    scrollX,
    scrollY,
  }: {
    scrollX: React.MutableRefObject<number>;
    scrollY: React.MutableRefObject<number>;
  }
) {
  const { x, y } = getBoundingClientRect(ref.current as any);
  return {
    x: x + scrollX.current + (window?.scrollX || 0),
    y: y + scrollY.current + (window?.scrollY || 0),
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
