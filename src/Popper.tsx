import { Portal, Surface } from 'react-native-paper';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import * as React from 'react';

export default function Popper({
  onPressOutside,
  children,
  surfaceStyle,
  outerRef,
  visible,
}: {
  onPressOutside: () => any;
  children: any;
  setPopperRef: any;
  attributes: any;
  styles: any;
  dropdownWidth: number;
  outerRef: any;
  surfaceStyle: any;
  maxHeight?: number;
  visible?: boolean;
}) {
  return (
    <Portal>
      <View
        pointerEvents="box-none"
        style={[StyleSheet.absoluteFill]}
        // @ts-ignore
        accessibilityExpanded={visible}
      >
        <TouchableWithoutFeedback onPress={onPressOutside}>
          <View ref={outerRef} style={[StyleSheet.absoluteFill, { flex: 1 }]} />
        </TouchableWithoutFeedback>
        <Surface style={surfaceStyle}>{children}</Surface>
      </View>
    </Portal>
  );
}
