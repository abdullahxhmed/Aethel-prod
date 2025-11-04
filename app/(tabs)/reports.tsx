import React from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ReportsScreen() {
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;

  const onReportPress = () => {
    Alert.alert('Report submitted', 'Thanks for letting us know.');
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={260}
          color="#808080"
          name="exclamationmark.triangle.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Reports
        </ThemedText>
      </ThemedView>

      <View style={{ gap: 16 }}>
        {/* Location tag (basic placeholder) */}
        <View style={styles.locationTag}>
          <IconSymbol size={16} name="mappin.circle.fill" color="#808080" />
          <ThemedText style={styles.locationText}>Location: Not attached</ThemedText>
        </View>

        {/* Report button */}
        <Pressable onPress={onReportPress} style={({ pressed }) => [styles.button, { backgroundColor: tint, opacity: pressed ? 0.9 : 1 }] }>
          <ThemedText type="defaultSemiBold" style={styles.buttonText}>Report Issue</ThemedText>
        </Pressable>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -70,
    left: -25,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  locationTag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#9BA1A633',
  },
  locationText: {
    fontSize: 14,
  },
  button: {
    alignSelf: 'stretch',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
  },
});

