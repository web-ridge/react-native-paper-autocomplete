import * as React from 'react';

export default function useLatest<T>(value: T): { readonly current: T } {
  const ref = React.useRef(value);
  ref.current = value;
  return ref;
}
