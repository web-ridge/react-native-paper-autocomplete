import * as React from 'react';
import Animated, { useSharedValue } from 'react-native-reanimated';

type AutocompleteContextType = {
  scrollableRef: React.RefObject<Animated.ScrollView>;
  scrollX: Animated.SharedValue<number>;
  scrollY: Animated.SharedValue<number>;
};
export const AutocompleteContext = React.createContext<AutocompleteContextType>(
  undefined as any
);

export function useAutocomplete() {
  let values = React.useContext(AutocompleteContext);
  if (!values) {
    console.warn(
      '[react-native-paper-autocomplete] your autocomplete is currently not wrapped inside a supported ' +
        'autocomplete scrollable, this could result in unexpected behavior and bugs. If this is inside a ' +
        'non-scrollable container you can ignore this message'
    );
  }
  const zero = useSharedValue(0);
  const fallbackValues = React.useMemo(() => {
    const fb: AutocompleteContextType = {
      scrollableRef: React.createRef<Animated.ScrollView>(),
      scrollX: zero,
      scrollY: zero,
    };
    return fb;
  }, [zero]);

  return values || fallbackValues;
}
