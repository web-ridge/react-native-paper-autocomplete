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
  autoCompleteProps,
}: {
  textInputMode: 'flat' | 'outlined';
  multiple: boolean;
  autoCompleteProps: any;
}) {
  const [options] = React.useState<ItemType[]>([
    {
      id: 1,
      name: 'Ruben von der Vein',
      gender: 'girl',
      icon: 'emoticon',
    },
    {
      id: 2,
      name: 'Pjotr Versjuurre',
      gender: 'boy',
      icon: 'emoticon',
    },
    { id: 3, name: 'Bjart von Klef', gender: 'boy', icon: 'emoticon' },
    {
      id: 4,
      name: 'Riesjard Lindhoe',
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
    <Autocomplete<ItemType>
      multiple={multiple}
      getOptionLabel={(item) => item.name}
      getOptionValue={(item) => item.id}
      getOptionIcon={(item) => item.icon}
      onChange={setValue}
      value={value}
      options={options}
      // if you want to group on something
      groupBy={(option) => option.gender}
      inputProps={{
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
      {...autoCompleteProps}
    />
  );
}
export default React.memo(Advanced);
