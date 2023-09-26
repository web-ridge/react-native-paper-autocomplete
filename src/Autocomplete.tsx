import * as React from 'react';
import {
  TextInputProps,
  View,
  ViewStyle,
  StyleSheet,
  TextInput as NativeTextInput,
  TextInputFocusEventData,
  NativeSyntheticEvent,
  FlatList,
  SectionList,
  // useWindowDimensions,
  FlatListProps,
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
import type { IconSource } from './icon';
import useHighlighted from './useHighlighted';
import PortalContent from './PortalContent';
import useComponentDimensions from './useComponentDimensions';
import PositionedSurface from './PositionedSurface';
import Animated, {
  DerivedValue,
  SharedValue,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import { useAutocomplete } from './AutocompleteContext';

// https://ej2.syncfusion.com/react/documentation/drop-down-list/accessibility/

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

// const AnimatedTextInput = createElement(TextInput);
export interface FilterOptionsParams<ItemT> {
  isFocusedAndValueIsSameAsSearch: boolean;
  inputValue: string;
  getOptionLabel: (option: ItemT) => string;
  getOptionDescription?: (option: ItemT) => string;
}

export interface AutocompleteBaseProps<ItemT> {
  testID?: string;
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
  disableInputPrefixIcon?: boolean;
  getOptionLabel?: (option: ItemT) => string;
  getOptionDescription?: (option: ItemT) => string | number;
  getOptionValue?: (option: ItemT) => string | number;
  getOptionIcon?: (option: ItemT) => IconSource;
  filterOptions?: (
    a: ReadonlyArray<ItemT> | null | undefined,
    {
      isFocusedAndValueIsSameAsSearch,
      inputValue,
      getOptionLabel,
      getOptionDescription,
    }: FilterOptionsParams<ItemT>
  ) => ReadonlyArray<ItemT> | null | undefined;
}

export interface AutocompleteMultipleProps<ItemT>
  extends AutocompleteBaseProps<ItemT> {
  multiple: true;
  value: ItemT[] | null | undefined;
  onChange: (v: ItemT[]) => void;
}

export interface AutocompleteSingleProps<ItemT>
  extends AutocompleteBaseProps<ItemT> {
  multiple?: undefined | false;
  value: ItemT | null | undefined;
  onChange: (v: ItemT | undefined) => void;
}

export function defaultFilterOptions<ItemT>(
  a: ReadonlyArray<ItemT> | null | undefined,
  {
    isFocusedAndValueIsSameAsSearch,
    inputValue,
    getOptionLabel,
    getOptionDescription,
  }: FilterOptionsParams<ItemT>
) {
  if (isFocusedAndValueIsSameAsSearch) {
    return a;
  }
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
  return a?.filter((o) => {
    let selected = multiple
      ? (rValue as ItemT[])?.some(
          (v) => getOptionValue(v) === getOptionValue(o)
        )
      : rValue && getOptionValue(rValue as ItemT) === getOptionValue(o);

    return !selected;
  });
}

export default function Autocomplete<ItemT>(
  props: AutocompleteMultipleProps<ItemT> | AutocompleteSingleProps<ItemT>
) {
  // const window = useWindowDimensions();
  const theme = useTheme();
  const { scrollableRef, scrollX, scrollY } = useAutocomplete();
  const {
    testID,
    loading,
    ListComponent,
    inputProps: { onChangeText, defaultValue, ...inputProps } = {},
    listProps,
    groupBy,
    multiple,
    options,
    style,
    value,
    getOptionValue = (option: ItemT) =>
      (option as any).id || (option as any).key || (option as any).value,
    getOptionLabel = (option: ItemT) =>
      (option as any).label || (option as any).name || (option as any).title,
    getOptionDescription = (option: ItemT) => (option as any).description,
    getOptionIcon = (option: ItemT) => (option as any).icon,
    filterOptions = (a, b) => defaultFilterOptions<ItemT>(a, b),
  } = props;
  const { value: values, onChange: onChangeMultiple } =
    props as AutocompleteMultipleProps<ItemT>;
  const { value: singleValue, onChange: onChangeSingle } =
    props as AutocompleteSingleProps<ItemT>;

  const inputContainerDimensions = useComponentDimensions();
  const chipsDimensions = useComponentDimensions();

  const chipContainerRef = useAnimatedRef<Animated.View>();
  const inputContainerRef = useAnimatedRef<Animated.View>();
  const inputRef = React.useRef<NativeTextInput>(null);
  const [inputValue, setInputValue] = React.useState(defaultValue || '');
  const [visible, setVisible] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

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
  const blur = (_: NativeSyntheticEvent<TextInputFocusEventData>) => {
    // console.log('blur', e);
    // setVisible(false);
    setFocused(false);
  };
  const focus = (_: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setVisible(true);
    setFocused(true);
  };

  const filterOptionsRef = useLatest(filterOptions);
  const groupByRef = useLatest(groupBy);
  const getOptionValueRef = useLatest(getOptionValue);
  const getOptionDescriptionRef = useLatest(getOptionDescription);

  const isFocusedAndValueIsSameAsSearch =
    (singleValue && focused && inputValue === getOptionLabel(singleValue)) ||
    false;

  // console.log({
  //   singleValue,
  //   focused,
  //   inputValue,
  //   inputValueCompareTo: singleValue && getOptionLabel(singleValue),
  //   isFocusedAndValueIsSameAsSearch,
  // });

  const data = React.useMemo(
    () =>
      filterOptionsRef.current(
        removeSelected(options, {
          value,
          multiple,
          getOptionValue: getOptionValueRef.current,
        }),
        {
          isFocusedAndValueIsSameAsSearch,
          getOptionLabel: getOptionLabelRef.current,
          getOptionDescription: getOptionDescriptionRef.current,
          inputValue,
        }
      ),
    [
      isFocusedAndValueIsSameAsSearch,
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

  const { highlightedIndex, handleKeyPress } = useHighlighted({
    inputValue,
    setInputValue,
    data,
    multiple,
    values,
    onChangeMultiple,
    onChangeSingle,
    inputRef,
    setVisible,
  });

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

  const minimalDropdownWidth = 250;
  const dropdownWidth = inputContainerDimensions.width;
  const remainingSpace = useDerivedValue(
    () => inputContainerDimensions.width.value - chipsDimensions.width.value,
    [inputContainerDimensions.width, chipsDimensions.width]
  );

  const shouldEnter = useDerivedValue(
    () =>
      chipsDimensions.height.value > 45 ||
      remainingSpace.value < minimalDropdownWidth,
    [chipsDimensions.height, remainingSpace]
  );
  const hasMultipleValue = multiple && (values || []).length > 0;

  // const animatedInputStyle = useAnimatedStyle(() => {
  //   return {
  //     height: hasMultipleValue
  //       ? shouldEnter
  //         ? chipsDimensions.height.value + 36 + 46
  //         : chipsDimensions.height.value + 36
  //       : undefined,
  //   };
  // }, [chipsDimensions.height, hasMultipleValue, shouldEnter]);
  const highlightedColor = React.useMemo(
    () =>
      theme.dark
        ? Color(theme.colors.onBackground).alpha(0.2).rgb().string()
        : Color(theme.colors.onBackground).alpha(0.1).rgb().string(),
    [theme.dark, theme.colors.onBackground]
  );

  const innerListProps = {
    testID: `${testID}-autocomplete-list`,
    keyboardDismissMode: 'on-drag',
    keyboardShouldPersistTaps: 'handled',
    contentInsetAdjustmentBehavior: 'always',
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
          testID={`${testID}-autocomplete-item-${key}`}
          key={key}
          highlightedColor={highlightedColor}
          title={getOptionLabel(item)}
          description={getOptionDescription(item)}
          icon={getOptionIcon(item)}
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

  const SectionListComponent = ListComponent ? ListComponent : SectionList;
  const FinalListComponent = ListComponent ? ListComponent : FlatList;

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
  const onPressOutside = React.useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  // console.log({
  //   visible,
  //   inputDim: inputContainerDimensions.dimensions,
  //   chipsDimensions,
  //   shouldEnter,
  // });

  const textInputIcon = singleValue ? getOptionIcon(singleValue) : undefined;
  return (
    <View style={[styles.menu, style]} accessibilityRole="menu" testID={testID}>
      <Animated.View
        ref={inputContainerRef}
        onLayout={inputContainerDimensions.onLayout}
        style={styles.inputContainer}
      >
        <TextInput
          ref={inputRef}
          onBlur={blur}
          onFocus={focus}
          blurOnSubmit={false}
          value={hasMultipleValue || inputValue.length > 0 ? ' ' : ''}
          left={
            textInputIcon && !props.disableInputPrefixIcon ? (
              <TextInput.Icon icon={textInputIcon} />
            ) : undefined
          }
          {...inputProps}
          style={[inputProps.style, styles.full]}
          // @ts-ignore web only props
          accessibilityHasPopup={true}
          render={(params) => {
            return (
              <NativeTextInputWithAnimatedStyles
                {...params}
                selectTextOnFocus={true}
                value={inputValue}
                onChangeText={changeText}
                onKeyPress={handleKeyPress}
                shouldEnter={shouldEnter}
                chipsHeight={chipsDimensions.height}
                chipsWidth={chipsDimensions.width}
                multiple={multiple}
              />
            );
          }}
        />
        {(multiple && visible) || (!multiple && value) ? (
          <IconButton
            testID="autocomplete-close"
            size={20}
            icon="close"
            style={styles.closeButton}
            onPress={() => {
              setVisible(false);
              setInputValue('');
              if (multiple) {
                onChangeMultiple([]);
              } else {
                onChangeSingle(undefined);
              }
            }}
          />
        ) : null}
        <IconButton
          testID={`${testID}-autocomplete-arrow`}
          style={styles.arrowIconButton}
          icon={visible ? 'menu-up' : 'menu-down'}
          onPress={() => {
            if (visible) {
              inputRef.current?.blur();
              setVisible(false);
            } else {
              inputRef.current?.focus();
              setVisible(true);
            }
          }}
        />
      </Animated.View>
      {multiple && (
        <Animated.View
          ref={chipContainerRef}
          testID={`${testID}-autocomplete-chips`}
          style={[styles.chipsWrapper, { backgroundColor }]}
          onLayout={chipsDimensions.onLayout}
          pointerEvents="box-none"
        >
          {values?.map((o) => (
            <Chip
              key={getOptionValue(o)}
              onClose={() => remove(o)}
              style={styles.chip}
              icon={getOptionIcon(o)}
            >
              {getOptionLabel(o)}
            </Chip>
          ))}
        </Animated.View>
      )}
      {loading ? <ActivityIndicator style={styles.loading} /> : null}
      {visible ? (
        <PortalContent visible={visible} onPressOutside={onPressOutside}>
          <PositionedSurface
            scrollableRef={scrollableRef}
            theme={theme}
            dropdownWidth={dropdownWidth}
            inputContainerRef={inputContainerRef}
            inputContainerHeight={inputContainerDimensions.height}
            scrollX={scrollX}
            scrollY={scrollY}
          >
            {groupBy ? (
              <SectionListComponent<ItemT>
                {...listProps}
                {...innerListProps}
                sections={sections}
                renderSectionHeader={({ section: { title } }: any) => (
                  <List.Subheader>{title}</List.Subheader>
                )}
                onScrollToIndexFailed={(info: any) => {
                  // TODO: make sure everything uses fixed heights so this error won't be there
                  // e.g.:  getItemLayout={getSectionListItemLayout}
                  console.error(info);
                }}
              />
            ) : (
              <FinalListComponent<ItemT>
                {...listProps}
                {...innerListProps}
                getItemLayout={getFlatListItemLayout}
                data={data}
              />
            )}
          </PositionedSurface>
        </PortalContent>
      ) : null}
    </View>
  );
}

const AnimatedNativeInput = Animated.createAnimatedComponent(NativeTextInput);
const NativeTextInputWithAnimatedStyles = React.forwardRef(
  (
    {
      shouldEnter,
      chipsHeight,
      chipsWidth,
      style,
      multiple,
      ...rest
    }: TextInputProps & {
      multiple: boolean | undefined;
      shouldEnter: DerivedValue<boolean>;
      chipsHeight: SharedValue<number>;
      chipsWidth: SharedValue<number>;
    },
    forwardedRef: any
  ) => {
    const originalStyle = StyleSheet.flatten(style);

    const orgTop = Number(originalStyle.paddingTop) || 0;
    const orgLeft = Number(originalStyle.paddingLeft) || 0;
    const height = Number(originalStyle.height) || 0;
    const animatedStyle = useAnimatedStyle(() => {
      if (!multiple) {
        return {};
      }
      const addTop = shouldEnter.value ? chipsHeight.value + 18 : 18;

      return {
        paddingTop: orgTop + addTop,
        paddingLeft: orgLeft + (shouldEnter.value ? 0 : chipsWidth.value),
        height: height + addTop,
      };
    }, [multiple, orgLeft, orgTop, shouldEnter, chipsHeight, chipsWidth]);

    return (
      <AnimatedNativeInput
        ref={forwardedRef}
        {...rest}
        style={[style, animatedStyle]}
      />
    );
  }
);

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
  },
  menu: {
    position: 'relative',
  },
  chipsWrapper: {
    flexDirection: 'row',
    position: 'absolute',
    flexWrap: 'wrap',
    top: 32,
    left: 12,
  },
  chip: { marginRight: 6, marginBottom: 6, flexShrink: 1 },

  inputContainer: { alignItems: 'center', flexDirection: 'row' },
  full: { flex: 1 },
  closeButton: {
    position: 'absolute',
    bottom: 6,
    right: 36,
  },
  arrowIconButton: {
    position: 'absolute',
    bottom: 5,
    right: 0,
  },
  loading: { position: 'absolute', right: 12, top: 24 },
});
