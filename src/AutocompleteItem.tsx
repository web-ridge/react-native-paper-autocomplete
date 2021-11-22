import { List } from 'react-native-paper';
import * as React from 'react';
import type { IconSource } from './icon';

function AutocompleteItem<T>({
  testID,
  selected,
  title,
  description,
  icon,
  option,
  onPress,
  highlightedColor,
}: {
  testID: string;
  selected: boolean;
  title: string | number;
  description: string | number | undefined;
  icon: IconSource | undefined;
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
      left={
        icon
          ? (leftProps) => <List.Icon icon={icon} {...leftProps} />
          : undefined
      }
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
