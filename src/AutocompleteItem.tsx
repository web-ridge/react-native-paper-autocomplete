import { List } from 'react-native-paper';
import * as React from 'react';

function AutocompleteItem<T>({
  testID,
  selected,
  title,
  description,
  option,
  onPress,
  highlightedColor,
}: {
  testID: string;
  selected: boolean;
  title: string | number;
  description: string | number | undefined;
  option: T;
  onPress: (o: T) => void;
  highlightedColor: string;
}) {
  return (
    // @ts-ignore
    <List.Item
      testID={testID}
      accessibilityRole="menuitem"
      accessibilityState={{
        selected,
      }}
      title={title}
      description={description}
      style={
        selected
          ? {
              backgroundColor: highlightedColor,
            }
          : undefined
      }
      onPress={() => {
        onPress(option);
      }}
    />
  );
}

export default React.memo(AutocompleteItem) as typeof AutocompleteItem;
