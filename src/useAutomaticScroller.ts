import * as React from 'react';
import type { FlatList, SectionList } from 'react-native';
import useLatest from './useLatest';

export default function useAutomaticScroller<ItemT>({
  highlightedIndex,
  sections,
  groupBy,
}: {
  highlightedIndex: number;
  sections: { title: string; data: ItemT[] }[];
  groupBy?: (option: ItemT) => string;
}) {
  const viewableItems = React.useRef<any[]>([]);
  const isSectionList = !!groupBy;
  const flatListRef = React.useRef<FlatList>(null);
  const sectionListRef = React.useRef<SectionList>(null);
  const sectionsRef = useLatest(sections);

  const onViewableItemsChanged = React.useCallback(
    (p: any) => {
      viewableItems.current = p.viewableItems;
    },
    [viewableItems]
  );

  React.useEffect(() => {
    if (isSectionList) {
      const viewAbleIndexes = viewableItems.current
        .map(({ index, section }) => {
          const sectionIndex = sectionsRef.current.indexOf(section);
          const indexesBefore = sectionsRef.current
            .filter((_, i) => i < sectionIndex)
            .reduce((a, b) => a + b.data.length, 0);
          if (index === null || index === undefined) {
            return null;
          }
          return {
            sectionIndex: sectionsRef.current.indexOf(section),
            index: index,
            realIndex: indexesBefore + (index || 0),
          };
        })
        .filter((n) => n);
      const isViewable = viewAbleIndexes
        .map((vi) => vi!.index)
        .includes(highlightedIndex);

      if (!isViewable) {
        const scrollParams = findSectionScrollParams({
          sections: sectionsRef.current,
          highlightedIndex,
        });

        sectionListRef.current?.scrollToLocation(scrollParams);
      }
    } else {
      const isViewable = viewableItems.current
        .map((vi) => vi.index)
        .includes(highlightedIndex);
      if (isViewable) {
        return;
      }
      flatListRef.current?.scrollToIndex({
        index: highlightedIndex,
        animated: false,
      });
    }
  }, [highlightedIndex, sectionsRef, flatListRef, isSectionList]);

  return {
    onViewableItemsChanged,
    ref: (isSectionList ? sectionListRef : flatListRef) as any,
  };
}

function findSectionScrollParams({
  sections,
  highlightedIndex,
}: {
  sections: any[];
  highlightedIndex: number;
}) {
  let i = 0;
  for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
    const section = sections[sectionIndex];
    for (let itemIndex = 0; itemIndex < section.data.length; itemIndex++) {
      if (i === highlightedIndex) {
        return {
          itemIndex,
          sectionIndex,
          animated: false,
        };
      }
      i++;
    }
  }
  return {
    itemIndex: 0,
    sectionIndex: 0,
    animated: false,
  };
}
