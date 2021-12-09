import * as React from 'react';
import type {
  NativeSyntheticEvent,
  TextInput as NativeTextInput,
  TextInputKeyPressEventData,
} from 'react-native';
import useLatest from './useLatest';
import type { Dispatch, SetStateAction, MutableRefObject } from 'react';

export default function useHighlighted<ItemT>({
  inputValue,
  setInputValue,
  data,
  multiple,
  values,
  onChangeMultiple,
  onChangeSingle,

  inputRef,
  setVisible,
}: {
  values: ItemT[] | null | undefined;
  inputValue: string;
  setInputValue: Dispatch<SetStateAction<string>>;
  data: readonly ItemT[] | null | undefined;
  multiple: undefined | boolean;
  onChangeMultiple: (v: ItemT[]) => void;
  onChangeSingle: (v: ItemT | undefined) => void;

  inputRef: MutableRefObject<NativeTextInput | null>;
  setVisible: Dispatch<SetStateAction<boolean>>;
}) {
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const highlightedRef = useLatest(highlightedIndex);
  const previousData = usePrevious(data);

  React.useEffect(() => {
    if (previousData) {
      const previousItem = previousData[highlightedRef.current];
      const currentItem = data?.indexOf(previousItem);

      if (currentItem && currentItem >= 0) {
        setHighlightedIndex(currentItem);
        return;
      }
    }

    const exists = data?.[highlightedRef.current];
    if (exists) {
      return;
    }
    const before = data?.[highlightedRef.current - 1];
    if (before) {
      setHighlightedIndex((prev) => prev - 1);
      return;
    }
    setHighlightedIndex(0);
  }, [data, previousData, setHighlightedIndex, highlightedRef]);

  const removeLast = React.useCallback(() => {
    if (multiple) {
      onChangeMultiple(
        (values || []).filter((_, i: number) => i !== (values || []).length - 1)
      );
    }
  }, [multiple, onChangeMultiple, values]);

  const pressHighlighted = React.useCallback(() => {
    if (multiple) {
      const selectedOption = data?.[highlightedRef.current];
      if (selectedOption) {
        onChangeMultiple([...(values || []), selectedOption]);
      }
      setInputValue('');
    } else {
      const selectedOption = data?.[highlightedRef.current];
      onChangeSingle(selectedOption);
      inputRef.current?.blur();
      setVisible(false);
    }
  }, [
    data,
    inputRef,
    setInputValue,
    setVisible,
    highlightedRef,
    multiple,
    onChangeMultiple,
    onChangeSingle,
    values,
  ]);

  const dataRef = useLatest(data);
  const handleKeyPress = React.useCallback(
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      const dataLength = dataRef.current?.length || 0;
      const lastIndex = dataLength - 1;
      const key = e.nativeEvent.key;
      switch (key) {
        case 'Backspace':
          if (inputValue === '') {
            removeLast();
          }
          break;
        case 'Enter':
          if (dataLength === 0) {
            return;
          }
          pressHighlighted();
          break;
        case 'ArrowDown':
          if ((dataLength || 0) - 1 >= highlightedRef.current + 1) {
            setHighlightedIndex((prev) => prev + 1);
          } else {
            setHighlightedIndex(0);
          }
          break;
        case 'ArrowUp':
          if (highlightedRef.current >= 1) {
            setHighlightedIndex((prev) => prev - 1);
          } else {
            setHighlightedIndex(lastIndex);
          }
          break;
        case 'Home':
          setHighlightedIndex(0);
          break;
        case 'End':
          if (dataLength > 0) {
            setHighlightedIndex(lastIndex);
          }
          break;
        default:
      }
    },
    [dataRef, highlightedRef, inputValue, pressHighlighted, removeLast]
  );

  return {
    handleKeyPress,
    highlightedIndex,
  };
}

function usePrevious<T>(
  value: T
): React.MutableRefObject<T | undefined>['current'] {
  const ref = React.useRef<T>();
  React.useLayoutEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
