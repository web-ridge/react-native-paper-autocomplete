import * as React from 'react';
import {
  TextInputProps,
  View,
  ViewStyle,
  StyleSheet,
  Animated,
  TextInput as NativeTextInput,
  TextInputFocusEventData,
  NativeSyntheticEvent,
  FlatList,
  SectionList,
  // useWindowDimensions,
  FlatListProps,
  ScrollView,
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

export interface AutocompleteBaseProps<ItemT> {
  testID?: string;
  scrollViewRef: React.MutableRefObject<ScrollView | null>;
  scrollX: React.MutableRefObject<number>;
  scrollY: React.MutableRefObject<number>;
  animatedScrollX: React.MutableRefObject<Animated.Value>;
  animatedScrollY: React.MutableRefObject<Animated.Value>;
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
  getOptionLabel?: (option: ItemT) => string;
  getOptionDescription?: (option: ItemT) => string | number;
  getOptionValue?: (option: ItemT) => string | number;
  getOptionIcon?: (option: ItemT) => IconSource;
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

export default function Autocomplete<ItemT>(
  props: AutocompleteMultipleProps<ItemT> | AutocompleteSingleProps<ItemT>
) {
  // const window = useWindowDimensions();
  const theme = useTheme();
  const {
    testID,
    // scrollViewRef,
    scrollX,
    scrollY,
    animatedScrollX,
    animatedScrollY,
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

  const chipContainerRef = React.useRef<View>(null);
  const inputContainerRef = React.useRef<View>(null);
  const inputRef = React.useRef<NativeTextInput>(null);
  const [inputValue, setInputValue] = React.useState(defaultValue || '');
  const [visible, setVisible] = React.useState(false);

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
  };
  const focus = (_: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setVisible(true);
  };

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
  const dropdownWidth = inputContainerDimensions.dimensions.width;
  const remainingSpace =
    inputContainerDimensions.dimensions.width -
    chipsDimensions.dimensions.width;

  const shouldEnter =
    chipsDimensions.dimensions.height > 45 ||
    remainingSpace < minimalDropdownWidth;
  const textInputLeft = shouldEnter ? 0 : chipsDimensions.dimensions.width;
  const textInputTop = shouldEnter ? chipsDimensions.dimensions.height + 18 : 0;

  const highlightedColor = React.useMemo(
    () =>
      theme.dark
        ? Color(theme.colors.text).alpha(0.2).rgb().string()
        : Color(theme.colors.text).alpha(0.1).rgb().string(),
    [theme.dark, theme.colors.text]
  );

  const innerListProps = {
    testID: `${testID}-autocomplete-list`,
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
  const onPressOutside = React.useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  // console.log({ inputLayoutLazy, chipsLayoutLazy });

  const textInputIcon = singleValue ? getOptionIcon(singleValue) : undefined;

  return (
    <View style={[styles.menu, style]} accessibilityRole="menu" testID={testID}>
      <View
        ref={inputContainerRef}
        onLayout={inputContainerDimensions.updateLayout}
        style={styles.inputContainer}
      >
        <TextInput
          ref={inputRef}
          onBlur={blur}
          onFocus={focus}
          blurOnSubmit={false}
          value={hasMultipleValue || inputValue.length > 0 ? ' ' : ''}
          left={
            textInputIcon ? (
              <TextInput.Icon
                name={textInputIcon}
                touchSoundDisabled={undefined}
              />
            ) : undefined
          }
          {...inputProps}
          style={[
            (inputProps as any).style,
            styles.full,
            {
              height: hasMultipleValue
                ? shouldEnter
                  ? chipsDimensions.dimensions.height + 36 + 46
                  : chipsDimensions.dimensions.height + 36
                : undefined,
            },
          ]}
          // @ts-ignore web only props
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
                onKeyPress={handleKeyPress}
                style={[
                  params.style,
                  {
                    paddingTop: (Number(paddingTop) || 0) + textInputTop,
                    paddingLeft: (Number(paddingLeft) || 0) + textInputLeft,
                  },
                ]}
              />
            );
          }}
        />
        <IconButton
          // TODO: fix RNP types bug
          touchSoundDisabled={undefined}
          testID={`${testID}-autocomplete-arrow`}
          style={styles.arrowIconButton}
          icon={visible ? 'menu-up' : 'menu-down'}
          onPress={() => {
            if (visible) {
              inputRef.current?.blur();
            } else {
              inputRef.current?.focus();
            }
          }}
        />
      </View>
      {multiple && (
        <Animated.View
          ref={chipContainerRef}
          testID={`${testID}-autocomplete-chips`}
          style={[styles.chipsWrapper, { backgroundColor }]}
          onLayout={chipsDimensions.updateLayout}
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
            theme={theme}
            dropdownWidth={dropdownWidth}
            inputContainerRef={inputContainerRef}
            inputContainerDimensions={
              inputContainerDimensions.animatedDimensions.current
            }
            scrollX={scrollX}
            scrollY={scrollY}
            animatedScrollX={animatedScrollX}
            animatedScrollY={animatedScrollY}
          >
            {/*<Button onPress={onPressOutside}>SLuit</Button>*/}
            {groupBy ? (
              <SectionListComponent<ItemT>
                {...listProps}
                {...innerListProps}
                sections={sections}
                renderSectionHeader={({ section: { title } }: any) => (
                  <List.Subheader
                    // TODO: fix RNP types bug
                    onTextLayout={undefined}
                    dataDetectorType={undefined}
                  >
                    {title}
                  </List.Subheader>
                )}
                onScrollToIndexFailed={(info: any) => {
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
  arrowIconButton: {
    position: 'absolute',
    bottom: 5,
    right: 0,
  },
  loading: { position: 'absolute', right: 12, top: 24 },
});
