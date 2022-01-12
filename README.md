
<h1 align="center">
  <img src="https://user-images.githubusercontent.com/6492229/120841024-45e8f680-c56b-11eb-9802-1697a0f84bea.png" width="128">
  <br>
  react-native-paper-autocomplete (⚠️ in beta)
</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/react-native-paper-autocomplete">
    <img src="https://img.shields.io/npm/v/react-native-paper-autocomplete.svg" alt="Current Release" />
  </a>
  <a href="https://www.npmjs.com/package/react-native-paper-autocomplete">
    <img src="https://badgen.net/npm/dt/react-native-paper-autocomplete" alt="Downloads" />
  </a>

  <a href="https://github.com/web-ridge/react-native-paper-autocomplete/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/web-ridge/react-native-paper-autocomplete.svg" alt="Licence">
  </a>
</p>


Great autocomplete package for React Native Paper with great web support.
- Uses re-animated to be smooth on iOS/Android/Web
- Keyboard support (Arrow down/up/end/start)
- Single + multiple
- Async connect with backend
- Grouped results
- Great web support (scrollable while open)

## Installation


```sh
yarn add react-native-paper-autocomplete
```
or
```sh
npm install react-native-paper-autocomplete
```

## Simple

```jsx
const options = [
  { value: 1, label: 'Ruben von der Vein' },
  { value: 2, label: 'Pjotr Versjuurre' },
  { value: 3, label: 'Bjart von Klef' },
  { value: 4, label: 'Riesjard Lindhoe' }
]
function Single() {
  return (
    <AutocompleteScrollView>
      <Autocomplete
        onChange={(newValue)=>{
          console.log({ newValue })
        }}
        value={options[0]}
        options={options}
        inputProps={{
          placeholder: 'Select user',
          // ...all other props which are available in react native paper
        }}
      />
  </AutocompleteScrollView>
  )
}

function Multi() {
  return (
    <AutocompleteScrollView>
      <Autocomplete
        multiple={true}
        onChange={(newValue)=>{
          console.log({ newValue })
        }}
        value={[options[0], options[1]]}
        options={options}
        inputProps={{
          placeholder: 'Select user',
          // ...all other props which are available in react native paper
        }}
      />
    </AutocompleteScrollView>
  )
}
```


## Advanced

```jsx


function Multi() {
  const [options, setOptions] = React.useState([
    { id: 1, name: 'Ruben von der Vein', gender: 'girl' },
    { id: 2, name: 'Pjotr Versjuurre', gender: 'boy' },
    { id: 3, name: 'Bjart von Klef', gender: 'boy' },
    { id: 4, name: 'Riesjard Lindhoe', gender: 'boy' }
  ])
  const onEndReached = () => {
    // fetch more items (paginated) e.g:
    const response = api.fetch(...)
    setOptions(prev => [...prev, response.data])
  }

  return (
    <AutocompleteScrollView>
      <Autocomplete
        multiple={true}
        getOptionLabel={(item) => item.name}
        getOptionValue={(item) => item.id}
        onChange={(newValue)=>{
          console.log({ newValue })
        }}
        value={[options[0], options[1]]}
        options={options}
        // if you want to group on something
        groupBy={(option) => option.gender}
        inputProps={{
          placeholder: 'Select user',
          // ...all other props which are available in react native paper
          onChangeText: (search) => {
           // Load from your backend
          },
        }}

        listProps={{
            onEndReached
              // + other FlatList props or SectionList if you specify groupBy
        }}
      />
    </AutocompleteScrollView>
  )
}
```


## Custom scrollable containers
* If your autocomplete is inside a `ScrollView` use `AutocompleteScrollView` instead of the native ScrollView
* If your autocomplete is inside a `FlatList` use `AutocompleteFlatList` instead of the native FlatList

* If you're using another scrollable component, make sure it has te same api as the scrollView and supports the
following properties: `ref, scrollEventThrottle, keyboardShouldPersistTaps, onScroll`

### Example of custom scrollable container with autocomplete support

```tsx
import CustomScrollView from '../CustomScrollView'
import { createAutocompleteScrollable } from 'react-native-paper-autocomplete'
const AnimatedCustomScrollView = createAutocompleteScrollable(CustomScrollView)
```



## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
