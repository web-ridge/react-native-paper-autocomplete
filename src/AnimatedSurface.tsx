import * as React from 'react';
import Animated from 'react-native-reanimated';
import { useTheme, overlay, shadow } from 'react-native-paper';
import type { ViewStyle } from 'react-native';

const AnimatedSurface = React.forwardRef(
  (
    {
      elevation = 4,
      style,
      children,
    }: {
      elevation?: number;
      style?: ViewStyle;
      children: any;
    },
    forwardedRef: React.Ref<any>
  ) => {
    const theme = useTheme();
    const { dark: isDarkTheme, mode, colors } = theme;

    return (
      <Animated.View
        ref={forwardedRef}
        style={[
          {
            backgroundColor:
              isDarkTheme && mode === 'adaptive'
                ? overlay(elevation, colors.surface)
                : colors.surface,
          },
          // we don't have animated values here for elevation
          elevation ? (shadow(elevation) as any) : undefined,
          style,
        ]}
      >
        {children}
      </Animated.View>
    );
  }
);

export default Animated.createAnimatedComponent(AnimatedSurface);
