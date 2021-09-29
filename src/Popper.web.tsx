import { View } from 'react-native';
import { Surface, useTheme } from 'react-native-paper';
import * as React from 'react';
import ReactDOM from 'react-dom';

export default function Popper({
  onPressOutside,
  children,
  setPopperRef,
  attributes,
  styles,
  dropdownWidth,
}: {
  onPressOutside: () => any;
  children: any;
  setPopperRef: any;
  attributes: any;
  styles: any;
  dropdownWidth: number;
  outerRef: any;
  surfaceStyle: any;
}) {
  const theme = useTheme();
  const ref = React.useRef();

  useOnClickOutside(ref, onPressOutside);
  return ReactDOM.createPortal(
    <View
      ref={setPopperRef as any}
      {...attributes.popper}
      style={[styles.popper, { zIndex: 99999 }] as any}
    >
      <View ref={ref as any}>
        <Surface
          style={{
            borderRadius: theme.roundness,
            zIndex: 9999,
            minWidth: dropdownWidth,
          }}
        >
          {children}
        </Surface>
      </View>
    </View>,
    document.querySelector('body')!
  );
}

// Hook
function useOnClickOutside(ref: any, handler: any) {
  React.useEffect(
    () => {
      const listener = (event: any) => {
        // Do nothing if clicking ref's element or descendent elements
        if (!ref.current || ref.current.contains(event.target)) {
          return;
        }
        handler(event);
      };
      document.addEventListener('mousedown', listener);
      document.addEventListener('touchstart', listener);
      return () => {
        document.removeEventListener('mousedown', listener);
        document.removeEventListener('touchstart', listener);
      };
    },
    // Add ref and handler to effect dependencies
    // It's worth noting that because passed in handler is a new ...
    // ... function on every render that will cause this effect ...
    // ... callback/cleanup to run every render. It's not a big deal ...
    // ... but to optimize you can wrap handler in useCallback before ...
    // ... passing it into this hook.
    [ref, handler]
  );
}
