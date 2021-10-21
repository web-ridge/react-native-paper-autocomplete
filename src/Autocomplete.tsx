import * as React from 'react';
import {
  FlatList,
  FlatListProps,
  LayoutChangeEvent,
  LayoutRectangle,
  NativeSyntheticEvent,
  Platform,
  SectionList,
  StyleSheet,
  TextInput as NativeTextInput,
  TextInputFocusEventData,
  TextInputKeyPressEventData,
  TextInputProps,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import {
  ActivityIndicator,
  Chip,
  IconButton,
  List,
  TextInput,
  useTheme,
} from 'react-native-paper';
import Color from 'color';

import useLatest from './useLatest';
import useAutomaticScroller from './useAutomaticScroller';
import AutocompleteItem from './AutocompleteItem';
import { usePopper } from 'react-popper';
// @ts-ignore
import ClickOutside from './Outside';
import Popper from './Popper';

type PaperInputProps = React.ComponentProps<typeof TextInput>;

export function getFlatListItemLayout(
  _: any[] | undefined | null,
  index: number
) {
  return {
    length: 63,
    offset: 63 * index,
    index,
  };
}

export interface AutocompleteBaseProps<ItemT> {
  loading?: boolean;
  listProps?: Omit<
    FlatListProps<ItemT>,
    'data' | 'renderItem' | 'ref' | 'keyExtractor' | 'extraData'
  >;
  inputProps?: PaperInputProps;
  ListComponent?: any;
  options: ReadonlyArray<ItemT> | null | undefined;
  groupBy?: (option: ItemT) => string;
  renderInput?: (params: TextInputProps) => any;
  style?: ViewStyle;
  maxHeight?: number;
  getOptionLabel?: (option: ItemT) => string;
  getOptionDescription?: (option: ItemT) => string | number;
  getOptionValue?: (option: ItemT) => string | number;
  filterOptions?: (
    a: ReadonlyArray<ItemT> | null | undefined,
    {
      inputValue,
      getOptionLabel,
      getOptionDescription,
    }: {
      inputValue: string;
      getOptionLabel: (option: ItemT) => string;
      getOptionDescription?: (option: ItemT) => string;
    }
  ) => ReadonlyArray<ItemT> | null | undefined;
}

export interface AutocompleteMultipleProps<ItemT>
  extends AutocompleteBaseProps<ItemT> {
  multiple: true;
  dense?: boolean;
  value: ItemT[] | null | undefined;
  onChange: (v: ItemT[]) => void;
  onPressArrow?: () => void;
  outerValue?: string;
}

export interface AutocompleteSingleProps<ItemT>
  extends AutocompleteBaseProps<ItemT> {
  multiple?: undefined | false;
  dense?: boolean;
  value: ItemT | null | undefined;
  onChange: (v: ItemT | undefined) => void;
  onPressArrow?: () => void;
  outerValue?: string;
}

export function defaultFilterOptions<ItemT>(
  a: ReadonlyArray<ItemT> | null | undefined,
  {
    inputValue,
    getOptionLabel,
    getOptionDescription,
  }: {
    inputValue: string;
    getOptionLabel: (option: ItemT) => string;
    getOptionDescription?: (option: ItemT) => string;
  }
) {
  return a?.filter((o) => {
    const oAny = o as any;
    if (!inputValue) {
      return true;
    }
    const search = inputValue.toLowerCase();
    const label = getOptionLabel(oAny) || '';
    const description = getOptionDescription?.(oAny) || '';
    return (
      label.toLowerCase().includes(search) ||
      description.toLowerCase().includes(search)
    );
  });
}

function removeSelected<ItemT>(
  a: ReadonlyArray<ItemT> | null | undefined,
  {
    value: rValue,
    multiple,
    getOptionValue,
  }: {
    value: ItemT | ItemT[] | null | undefined;
    multiple: boolean | undefined;
    getOptionValue: (option: ItemT) => string | number;
  }
) {
  // console.log({ value });
  return a?.filter((o) => {
    let selected = multiple
      ? (rValue as ItemT[])?.some(
          (v) => getOptionValue(v) === getOptionValue(o)
        )
      : rValue && getOptionValue(rValue as ItemT) === getOptionValue(o);

    return !selected;
  });
}

const defaultLayout: LayoutRectangle = {
  y: 0,
  x: 0,
  width: 0,
  height: 0,
};

export default function Autocomplete<ItemT>(
  props: AutocompleteMultipleProps<ItemT> | AutocompleteSingleProps<ItemT>
) {
  const windowConst = useWindowDimensions();
  const theme = useTheme();
  const {
    loading,
    ListComponent,
    inputProps: { onChangeText, defaultValue, ...inputProps } = {},
    listProps,
    groupBy,
    multiple,
    options,
    style,
    value,
    maxHeight,
    getOptionValue = (option: ItemT) =>
      (option as any).id || (option as any).key || (option as any).value,
    getOptionLabel = (option: ItemT) =>
      (option as any).label || (option as any).name || (option as any).title,
    getOptionDescription = (option: ItemT) => (option as any).description,
    filterOptions = (a, b) => defaultFilterOptions<ItemT>(a, b),
  } = props;
  const { value: values, onChange: onChangeMultiple } =
    props as AutocompleteMultipleProps<ItemT>;
  const { value: singleValue, onChange: onChangeSingle } =
    props as AutocompleteSingleProps<ItemT>;

  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const [inputLayout, setInputLayout] =
    React.useState<LayoutRectangle>(defaultLayout);
  const [chipsLayout, setChipsLayout] =
    React.useState<LayoutRectangle>(defaultLayout);
  const inputContainerRef = React.useRef<View>(null);
  const inputRef = React.useRef<NativeTextInput>(null);
  const [inputValue, setInputValue] = React.useState(defaultValue || '');
  const [visible, setVisible] = React.useState(false);
  const ref = React.createRef();
  const outerRef = React.useRef<any>(ref);

  React.useEffect(() => {
    if (props.outerValue !== inputValue && props.outerValue !== undefined) {
      setInputValue(props.outerValue);
    }
  }, [props.outerValue, inputValue]);

  // React.useEffect(() => {
  //   const ref = outerRef.current;
  //   console.log(outerRef);
  //   const listener = (e: WheelEvent) => {
  //     console.log('WHEEELL');
  //     e.preventDefault();
  //
  //     return false;
  //   };
  //
  //   if (ref) {
  //     ref.addEventListener('wheel', listener, { passive: false });
  //     return () => {
  //       ref.removeEventListener('wheel', listener);
  //     };
  //   }
  //   return;
  // }, []);

  const getOptionLabelRef = useLatest(getOptionLabel);
  React.useEffect(() => {
    if (!multiple) {
      if (singleValue) {
        setInputValue(getOptionLabelRef.current(singleValue));
      } else {
        setInputValue('');
      }
    }
  }, [getOptionLabelRef, multiple, singleValue]);

  const changeText = (v: string) => {
    // setVisible(true);
    setInputValue(v);
    onChangeText?.(v);
  };
  const blur = (_: any) => {
    // console.log('blur', e);
    // setVisible(false);
  };
  const focus = (_: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setVisible(true);
  };
  const layout = (e: LayoutChangeEvent) => {
    const l = { ...e.nativeEvent.layout };
    setInputLayout({
      ...l,
      x: (l as any).left || l.x,
      y: (l as any).top || l.y,
    });
  };

  const layoutChips = (e: LayoutChangeEvent) => {
    const l = { ...e.nativeEvent.layout };
    setChipsLayout({
      ...l,
      x: (l as any).left || l.x,
      y: (l as any).top || l.y,
    });
  };

  const inputLayoutRef = useLatest(inputLayout);
  const recalculateLayout = React.useCallback(() => {
    if (Platform.OS === 'web') {
      return;
    }

    if (!inputContainerRef.current) {
      return;
    }

    inputContainerRef.current.measureInWindow(
      (x: number, y: number, width: number, height: number) => {
        const old = inputLayoutRef.current;

        if (
          old.x !== x ||
          old.y !== y ||
          old.width !== width ||
          old.height !== height
        ) {
          setInputLayout({
            x,
            y,
            width,
            height,
          });
        }
      }
    );
  }, [setInputLayout, inputLayoutRef, inputContainerRef]);

  // update left/top of textinput
  React.useEffect(() => {
    recalculateLayout();
  });

  const filterOptionsRef = useLatest(filterOptions);
  const groupByRef = useLatest(groupBy);
  const getOptionValueRef = useLatest(getOptionValue);
  const getOptionDescriptionRef = useLatest(getOptionDescription);

  const data = React.useMemo(
    () =>
      filterOptionsRef.current(
        removeSelected(options, {
          value,
          multiple,
          getOptionValue: getOptionValueRef.current,
        }),
        {
          getOptionLabel: getOptionLabelRef.current,
          getOptionDescription: getOptionDescriptionRef.current,
          inputValue,
        }
      ),
    [
      filterOptionsRef,
      inputValue,
      value,
      multiple,
      options,
      getOptionValueRef,
      getOptionLabelRef,
      getOptionDescriptionRef,
    ]
  );

  const sections = React.useMemo(() => {
    if (!groupByRef || !groupByRef.current) {
      return [];
    }
    let grouped: { [key: string]: ItemT[] } = {};
    data?.forEach((o) => {
      const key = groupByRef.current!(o);
      const current = grouped[key];
      if (current) {
        current.push(o);
      } else {
        grouped[key] = [o];
      }
    });

    return Object.keys(grouped).map((k) => ({
      title: k,
      data: grouped[k],
    }));
  }, [data, groupByRef]);

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
      const selectedOption = data?.[highlightedIndex];
      if (selectedOption) {
        onChangeMultiple([...(values || []), selectedOption]);
      }
      setInputValue('');
    } else {
      const selectedOption = data?.[highlightedIndex];
      onChangeSingle(selectedOption);
      inputRef.current?.blur();
      setVisible(false);
    }
  }, [
    data,
    highlightedIndex,
    multiple,
    onChangeMultiple,
    onChangeSingle,
    values,
  ]);

  const [referenceRef, setReferenceRef] = React.useState(null);
  const [popperRef, setPopperRef] = React.useState(null);

  const { styles, attributes, update } = usePopper(referenceRef, popperRef, {
    placement: 'top-start',
    strategy: 'fixed',
    // onFirstUpdate: (state) =>
    //   console.log('Popper positioned on', state.placement),
    // modifiers: [],
  });
  const press = React.useCallback(
    (o: ItemT) => {
      if (multiple) {
        inputRef.current?.focus();
        onChangeMultiple([...(values || []), o]);
        setInputValue('');
      } else {
        onChangeSingle(o);
        setVisible(false);
      }

      if (update && Platform.OS === 'web') {
        update();
      }
    },
    [multiple, setInputValue, onChangeMultiple, onChangeSingle, values]
  );

  const remove = React.useCallback(
    (o: ItemT) => {
      if (multiple) {
        const excludeCurrent = (values || []).filter(
          (vo) => getOptionValueRef.current(vo) !== getOptionValueRef.current(o)
        );
        onChangeMultiple(excludeCurrent);
      }
    },
    [getOptionValueRef, multiple, onChangeMultiple, values]
  );

  const automaticScrollProps = useAutomaticScroller({
    highlightedIndex,
    sections,
    groupBy,
  });

  const dropdownWidth = Math.min(inputLayout.width, 250);
  const remainingSpace = inputLayout.width - chipsLayout.width;

  const shouldEnter = chipsLayout.height > 45 || remainingSpace < dropdownWidth;
  const textInputLeft = shouldEnter ? 0 : chipsLayout.width;
  const textInputTop = shouldEnter ? chipsLayout.height + 18 : 0;
  const highlightedColor = theme.dark
    ? Color(theme.colors.text).alpha(0.2).rgb().string()
    : Color(theme.colors.text).alpha(0.1).rgb().string();

  const innerListProps = {
    testID: 'autocomplete-list',
    renderItem: ({
      item,
      index,
      section,
    }: {
      item: ItemT;
      index: number;
      section?: any;
    }) => {
      const key = getOptionValue(item);
      let realIndex = index;
      if (section) {
        // what the hell...
        const sectionIndex = sections.indexOf(section);
        const indexesBefore = sections
          .filter((_, i) => i < sectionIndex)
          .reduce((a, b) => a + b.data.length, 0);
        realIndex = indexesBefore + index;
      }
      return (
        <AutocompleteItem<ItemT>
          testID={`autocomplete-item-${key}`}
          key={key}
          highlightedColor={highlightedColor}
          title={getOptionLabel(item)}
          description={getOptionDescription(item)}
          selected={highlightedIndex === realIndex}
          onPress={press}
          option={item}
        />
      );
    },
    keyExtractor: (item: ItemT) => getOptionValue(item),
    extraData: { highlightedIndex },
    ...automaticScrollProps,
  };

  const keyPress = React.useCallback(
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      if (Platform.OS !== 'web') {
        return;
      }

      const key = e.nativeEvent.key;
      switch (key) {
        case 'Backspace':
          if (inputValue === '') {
            removeLast();
          }
          break;
        case 'Enter':
          if (data?.length === 0) {
            return;
          }
          pressHighlighted();
          break;
        case 'ArrowDown':
          if ((data?.length || 0) - 1 >= highlightedIndex + 1) {
            setHighlightedIndex((prev) => prev + 1);
          }
          break;
        case 'ArrowUp':
          if (highlightedIndex >= 1) {
            setHighlightedIndex((prev) => prev - 1);
          }
          break;
        case 'Home':
          setHighlightedIndex(0);
          break;
        case 'End':
          if (data && data.length > 0) {
            setHighlightedIndex(data?.length - 1);
          }
          break;
        case 'Escape':
          setVisible(false);
          break;
        default:
      }
    },
    [data, highlightedIndex, inputValue, pressHighlighted, removeLast]
  );

  const SectionListComponent = ListComponent ? ListComponent : SectionList;
  const FinalListComponent = ListComponent ? ListComponent : FlatList;

  const hasMultipleValue = multiple && (values || []).length > 0;

  const inputStyle = (inputProps as any)?.style;
  const backgroundColor = React.useMemo(() => {
    if (inputStyle) {
      const flattenStyle = StyleSheet.flatten(inputStyle);
      if (flattenStyle.backgroundColor) {
        return flattenStyle.backgroundColor;
      }
    }
    return theme.colors.background;
  }, [theme, inputStyle]);
  return (
    <View
      style={[innerStyles.menu, style]}
      accessibilityRole="menu"
      testID="autocomplete"
    >
      <View
        ref={inputContainerRef}
        onLayout={layout}
        style={innerStyles.inputContainer}
      >
        <View ref={setReferenceRef as any} style={innerStyles.full}>
          <TextInput
            ref={inputRef}
            onBlur={blur}
            onFocus={focus}
            blurOnSubmit={false}
            value={hasMultipleValue || inputValue.length > 0 ? ' ' : ''}
            {...inputProps}
            dense={props.dense}
            style={[
              // @ts-ignore
              inputProps.style,
              innerStyles.full,
              {
                height: hasMultipleValue
                  ? shouldEnter
                    ? chipsLayout.height + 36 + 46
                    : chipsLayout.height + 36
                  : undefined,
              },
            ]}
            //@ts-ignore
            accessibilityHasPopup={true}
            render={(params) => {
              const { paddingTop, paddingLeft } = StyleSheet.flatten(
                params.style
              );
              return (
                <NativeTextInput
                  {...params}
                  selectTextOnFocus={true}
                  value={inputValue}
                  onChangeText={changeText}
                  onKeyPress={keyPress}
                  style={[
                    params.style,
                    {
                      paddingTop: (Number(paddingTop) || 0) + textInputTop,
                      paddingLeft: (Number(paddingLeft) || 14) + textInputLeft,
                    },
                  ]}
                />
              );
            }}
          />
        </View>
        {/*// @ts-ignore*/}
        <IconButton
          testID="autocomplete-arrow"
          style={[innerStyles.arrowIconButton, props.dense && { bottom: -4 }]}
          icon={visible ? 'menu-up' : 'menu-down'}
          onPress={() => {
            if (props.onPressArrow) {
              props.onPressArrow();
            } else {
              if (visible) {
                inputRef.current?.blur();
              } else {
                inputRef.current?.focus();
              }
            }
          }}
        />
        {multiple && (
          <View
            testID="autocomplete-chips"
            style={[innerStyles.chipsWrapper, { backgroundColor }]}
            onLayout={layoutChips}
            pointerEvents="box-none"
          >
            {values?.map((o) => (
              <Chip
                key={getOptionValue(o)}
                onClose={() => remove(o)}
                style={innerStyles.chip}
              >
                {getOptionLabel(o)}
              </Chip>
            ))}
          </View>
        )}
        {(inputValue || (multiple && values && values.length > 0)) && (
          <IconButton
            testID="autocomplete-close"
            size={20}
            icon="close"
            style={[
              {
                position: 'absolute',
                bottom: 6,
                right: 6 + 28,
              },
              props.dense && { bottom: -4 },
            ]}
            onPress={() => {
              setVisible(false);
              setInputValue('');
              if (multiple) {
                onChangeMultiple([]);
              } else {
                onChangeSingle(undefined);
              }
            }}
            touchSoundDisabled={undefined}
          />
        )}
      </View>
      {loading ? <ActivityIndicator style={innerStyles.loading} /> : null}
      {visible && (
        <Popper
          onPressOutside={() => {
            setVisible(false);
          }}
          attributes={attributes}
          styles={styles}
          setPopperRef={setPopperRef}
          visible={visible}
          dropdownWidth={dropdownWidth}
          outerRef={outerRef}
          maxHeight={maxHeight}
          surfaceStyle={[
            innerStyles.surface,
            {
              top: inputLayout.y + inputLayout.height, // change maxHeight too!
              left: inputLayout.x + textInputLeft,
              minWidth: dropdownWidth,
              borderRadius: theme.roundness,
              maxHeight:
                windowConst.height - (inputLayout.y + inputLayout.height),
              zIndex: 10000,
            },
          ]}
        >
          {groupBy ? (
            <SectionListComponent<ItemT>
              {...listProps}
              {...innerListProps}
              sections={sections}
              renderSectionHeader={({ section: { title } }: any) => (
                // @ts-ignore
                <List.Subheader>{title}</List.Subheader>
              )}
            />
          ) : (
            <FinalListComponent<ItemT>
              {...listProps}
              {...innerListProps}
              getItemLayout={getFlatListItemLayout}
              data={data}
            />
          )}
        </Popper>
      )}
    </View>
  );
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

const innerStyles = StyleSheet.create({
  menu: { position: 'relative' },
  chipsWrapper: {
    flexDirection: 'row',
    position: 'absolute',
    flexWrap: 'wrap',
    top: 32,
    left: 12,
  },
  chip: { marginRight: 6, marginBottom: 6, flexShrink: 1 },
  surface: {
    // @ts-ignore
    position: 'absolute',
    overflow: 'hidden',
  },
  inputContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  full: {
    flex: 1,
    // @ts-ignore
    position: Platform.OS === 'web' ? 'static' : 'relative',
  },
  arrowIconButton: {
    position: 'absolute',
    bottom: 5,
    right: 0,
  },
  loading: { position: 'absolute', right: 12, top: 24 },
});
