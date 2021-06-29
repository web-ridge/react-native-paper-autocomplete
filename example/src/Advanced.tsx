import * as React from 'react';

// TODO: add example app
// @ts-ignore
import { Autocomplete } from 'react-native-paper-autocomplete';

function Advanced({ multiple }: { multiple: boolean }) {
  const [options] = React.useState([
    { id: 1, name: 'Ruben von der Vein', gender: 'girl' },
    { id: 2, name: 'Pjotr Versjuurre', gender: 'boy' },
    { id: 3, name: 'Bjart von Klef', gender: 'boy' },
    { id: 4, name: 'Riesjard Lindhoe', gender: 'boy' },
  ]);
  const [value, setValue] = React.useState(
    multiple ? [options[0], options[1]] : options[0]
  );
  const onEndReached = () => {
    // fetch more items (paginated) e.g:
    // const response = api.fetch(...)
    // setOptions((prev) => [...prev, response.data]);
  };

  return (
    <Autocomplete
      multiple={multiple}
      getOptionLabel={(item) => item.name}
      getOptionValue={(item) => item.id}
      onChange={setValue}
      value={value}
      options={options}
      // if you want to group on something
      groupBy={(option) => option.gender}
      //@ts-ignore
      inputProps={{
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
