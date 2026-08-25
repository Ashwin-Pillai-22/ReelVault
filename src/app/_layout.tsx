import { initDatabase } from "@/database/database";
import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { useShareIntent } from "expo-share-intent";
import { Alert } from "react-native";

export default function RootLayout() {
  useEffect(() => {
    initDatabase();
  }, []);

  const {
    hasShareIntent,
    shareIntent,
    resetShareIntent,
  } = useShareIntent();

  useEffect(() => {
    if (!hasShareIntent) {
      return;
    }

    const url =
      shareIntent?.webUrl ||
      shareIntent?.text;

    if (!url) {
      Alert.alert('Oops!', 'No URL received from share intent')
      return;
    }

    // Open the Save Reel screen
    router.push({
      pathname: "/Share",
      params: {
        url: url,
      },
    });

    // Clear the intent after extracting the URL
    resetShareIntent();

  }, [
    hasShareIntent,
    shareIntent,
  ]);
  return (
    <Stack>
      <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
    </Stack>
  )
}
