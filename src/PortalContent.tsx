import * as React from 'react';
import usePressOutside from './usePressOutside';
import { View, StyleSheet } from 'react-native';
import { Portal } from 'react-native-paper';

export default function PortalContent({
  children,
  visible,
  onPressOutside,
}: {
  children: any;
  visible: boolean;
  onPressOutside: () => void;
}) {
  const ref = React.useRef(null);
  usePressOutside(ref, onPressOutside);

  if (!visible) {
    return null;
  }
  return (
    <Portal>
      <View
        ref={ref}
        pointerEvents="box-none"
        style={[
          StyleSheet.absoluteFill,
          {
            overflow: 'hidden',
          },
        ]}
        // @ts-ignore web only prop
        accessibilityExpanded={visible}
      >
        {children}
      </View>
    </Portal>
  );
}
