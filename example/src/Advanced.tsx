import * as React from 'react';
import { Image } from 'react-native';

import { Autocomplete } from '../../src/index';

type ItemType = {
  id: number;
  name: string;
  gender: 'girl' | 'boy';
  icon: any;
};

function Advanced({
  textInputMode,
  multiple,
}: {
  textInputMode: 'flat' | 'outlined';
  multiple: boolean;
}) {
  const [options] = React.useState<ItemType[]>([
    {
      id: 1,
      name: 'Jannette Jansen',
      gender: 'girl',
      icon: 'emoticon',
    },
    {
      id: 2,
      name: 'Peter Lansen',
      gender: 'boy',
      icon: 'emoticon',
    },
    { id: 3, name: 'Rick der Zwaan', gender: 'boy', icon: 'emoticon' },
    { id: 4, name: 'Billy Shilly', gender: 'boy', icon: 'emoticon' },
    {
      id: 5,
      name: 'Jan Jansen',
      gender: 'boy',
      icon: (iconProps: any) => (
        <Image
          style={{
            width: iconProps.size + 6,
            height: iconProps.size + 6,
            borderRadius: 20,
          }}
          source={{
            uri: 'https://s.gravatar.com/avatar/3375f795a02ff49fd904bc5a15dcdf99?s=80',
          }}
        />
      ),
    },
  ]);
  const [value, setValue] = React.useState(multiple ? [] : null);
  const onEndReached = () => {
    // fetch more items (paginated) e.g:
    // const response = api.fetch(...)
    // setOptions((prev) => [...prev, response.data]);
  };

  return (
    //@ts-ignore
    <Autocomplete<ItemType>
      multiple={multiple}
      getOptionLabel={(item) => item.name}
      getOptionValue={(item) => item.id}
      getOptionIcon={(item) => item.icon}
      //@ts-ignore
      onChange={setValue}
      value={value}
      options={options}
      // if you want to group on something
      groupBy={(option) => option.gender}
      inputProps={{
        // dense: true, // TODO: fix multiple height with chips!
        mode: textInputMode,
        placeholder: 'Select user',
        // ...all other props which are available in react native paper
        onChangeText: (_) => {
          // Load from your backend
        },
        style: {
          backgroundColor: 'transparent',
        },
      }}
      listProps={{
        onEndReached,
        // + other FlatList props or SectionList if you specify groupBy
      }}
    />
  );
}
export default React.memo(Advanced);
