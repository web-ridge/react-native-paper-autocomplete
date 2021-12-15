import * as React from 'react';
import Advanced from './Advanced';
import {
  StyleSheet,
  // ScrollView,
  View,
  Linking,
  Image,
  Animated,
  Platform,
} from 'react-native';

import {
  Title,
  Button,
  Text,
  Provider as PaperProvider,
  useTheme,
  overlay,
  Paragraph,
  Appbar,
} from 'react-native-paper';
import { useAutocompleteScrollView } from '../../src';

function AppInner() {
  const theme = useTheme();
  const backgroundColor =
    theme.dark && theme.mode === 'adaptive'
      ? overlay(3, theme.colors.surface)
      : (theme.colors.surface as any);
  const { autoCompleteProps, scrollViewProps } = useAutocompleteScrollView();
  return (
    <>
      <Appbar>
        <Appbar.Content title="React Native Paper Autocomplete" />
      </Appbar>
      <Animated.ScrollView
        {...scrollViewProps}
        style={[
          styles.root,
          {
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Image source={require('./logo.png')} style={styles.logo} />
            <Title>react-native-paper-autocomplete</Title>
          </View>

          <Paragraph>
            The autocomplete package you wished for on all platforms (iOS,
            Android, web) brought to you by {/*// @ts-ignore*/}
            <Text
              onPress={() => Linking.openURL('https://webridge.nl')}
              style={styles.underline}
            >
              webRidge
            </Text>
          </Paragraph>
          <Paragraph>Example version: 0.1.1</Paragraph>
        </View>
        <View style={styles.content}>
          <Button
            uppercase={false}
            mode="contained"
            icon="github"
            style={styles.twitterButton}
            onPress={() =>
              Linking.openURL(
                'https://github.com/web-ridge/react-native-paper-autocomplete'
              )
            }
          >
            GitHub
          </Button>
          <TwitterFollowButton userName={'RichardLindhout'} />
          <TwitterFollowButton userName={'web_ridge'} />
        </View>
        <Animated.View
          style={[
            styles.content,
            styles.contentShadow,
            {
              backgroundColor,
            },
          ]}
        >
          <Enter />
          <Enter />
          <Enter />
          <Enter />
          <Advanced
            textInputMode={'flat'}
            multiple={true}
            autoCompleteProps={autoCompleteProps}
          />
          <Advanced
            textInputMode={'flat'}
            multiple={false}
            autoCompleteProps={autoCompleteProps}
          />
          <Advanced
            textInputMode={'flat'}
            multiple={false}
            autoCompleteProps={autoCompleteProps}
          />
          <Advanced
            textInputMode={'outlined'}
            multiple={false}
            autoCompleteProps={autoCompleteProps}
          />
          <Advanced
            textInputMode={'flat'}
            multiple={true}
            autoCompleteProps={autoCompleteProps}
          />

          <Enter />
          <Enter />

          <Enter />
        </Animated.View>

        <View style={{ height: 1500 }} />
      </Animated.ScrollView>
    </>
  );
}

function Enter() {
  return <View style={styles.enter} />;
}

// function Row({ children }: { children: any }) {
//   return <View style={styles.row}>{children}</View>;
// }
//
// function Label({ children }: { children: string }) {
//   const theme = useTheme();
//   return (
//     <Text style={[styles.label, { ...theme.fonts.medium }]}>{children}</Text>
//   );
// }

export default function App() {
  return (
    <PaperProvider>
      <View
        style={
          Platform.OS === 'web' ? { flex: 1, maxHeight: '100vh' } : { flex: 1 }
        }
      >
        <AppInner />
      </View>
    </PaperProvider>
  );
}

function TwitterFollowButton({ userName }: { userName: string }) {
  return (
    <Button
      uppercase={false}
      mode="outlined"
      icon="twitter"
      style={styles.twitterButton}
      onPress={() => Linking.openURL(`https://twitter.com/${userName}`)}
    >
      @{userName}
    </Button>
  );
}

const styles = StyleSheet.create({
  underline: { textDecorationLine: 'underline' },
  logo: { width: 56, height: 56, marginRight: 24 },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  twitterButton: { marginBottom: 16 },
  root: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: 600,
    marginTop: 24,
    padding: 24,
    alignSelf: 'center',
  },
  contentInline: {
    padding: 0,
    height: 600,
  },
  contentShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 3,
  },
  switchContainer: {
    flexDirection: 'row',
    marginTop: 24,
    alignItems: 'center',
  },
  switchSpace: { flex: 1 },
  switchLabel: { fontSize: 16 },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 24 },
  pickButton: { marginTop: 6 },
  buttonSeparator: { width: 6 },
  enter: { height: 12 },
  label: { width: 100, fontSize: 16 },
  row: { paddingTop: 12, paddingBottom: 12, flexDirection: 'row' },
});
