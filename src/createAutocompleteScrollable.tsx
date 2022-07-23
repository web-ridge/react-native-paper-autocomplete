import * as React from 'react';
import { useScrollableProps, AutocompleteScrollableProps } from './shared';
import { AutocompleteContext } from './AutocompleteContext';

export default function createAutocompleteScrollable<
  T extends React.ComponentType<AutocompleteScrollableProps>
>(WrappedComponent: T): React.ComponentType<T> {
  return React.forwardRef(function (rest, ref) {
    const { scrollableRef, scrollX, scrollY, scrollableProps } =
      useScrollableProps(rest, ref);
    const WW = WrappedComponent as any;
    return (
      <AutocompleteContext.Provider value={{ scrollableRef, scrollX, scrollY }}>
        <WW {...rest} {...scrollableProps} />
      </AutocompleteContext.Provider>
    );
  }) as any;
}
