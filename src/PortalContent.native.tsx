import * as React from 'react';
import { Portal } from 'react-native-paper';
import { StyleSheet, TouchableOpacity } from 'react-native';

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
