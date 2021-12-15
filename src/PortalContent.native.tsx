import * as React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Portal } from 'react-native-paper';

export default function PortalContent({
  children,
  onPressOutside,
}: {
  children: any;
  visible: boolean;
  onPressOutside: () => void;
}) {
  return (
    <Portal>
      {children}
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        onPress={onPressOutside}
      />
    </Portal>
  );
}
