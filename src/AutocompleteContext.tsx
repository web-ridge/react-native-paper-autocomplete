import * as React from 'react';
import type Animated from 'react-native-reanimated';

type AutocompleteContextType = {
  scrollViewRef: React.RefObject<Animated.ScrollView>;
  scrollX: Animated.SharedValue<number>;
  scrollY: Animated.SharedValue<number>;
};
export const AutocompleteContext = React.createContext<AutocompleteContextType>(
  undefined as any
);

export function useAutocomplete() {
  return React.useContext(AutocompleteContext);
}
