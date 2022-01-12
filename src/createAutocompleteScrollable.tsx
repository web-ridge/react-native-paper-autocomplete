import * as React from 'react';
import { useScrollableProps, AutocompleteScrollableProps } from './shared';
import { AutocompleteContext } from './AutocompleteContext';

export default function createAutocompleteScrollable<
  T extends AutocompleteScrollableProps
>(WrappedComponent: React.ComponentType<T>): React.ComponentType<T> {
  return function (rest) {
    const { scrollableRef, scrollX, scrollY, scrollableProps } =
      useScrollableProps();
    return (
      <AutocompleteContext.Provider value={{ scrollableRef, scrollX, scrollY }}>
        <WrappedComponent {...rest} {...scrollableProps} />
      </AutocompleteContext.Provider>
    );
  };
}
