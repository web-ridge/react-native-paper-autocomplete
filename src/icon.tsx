// copied from react-native-paper

import type React from 'react';
import type { ImageSourcePropType } from 'react-native';
declare type IconSourceBase = string | ImageSourcePropType;
export declare type IconSource =
  | IconSourceBase
  | Readonly<{
      source: IconSourceBase;
      direction: 'rtl' | 'ltr' | 'auto';
    }>
  | ((
      props: IconProps & {
        color: string;
      }
    ) => React.ReactNode);
declare type IconProps = {
  size: number;
  allowFontScaling?: boolean;
};
