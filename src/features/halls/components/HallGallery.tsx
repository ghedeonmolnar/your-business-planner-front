import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Hall } from '@/features/halls/types';
import { HallPhoto } from '@/features/halls/components/HallPhoto';
import { hallStyles as styles } from '@/features/halls/components/hallStyles';

export function HallGallery({ hall }: { hall: Hall }) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { width, height } = dimensions;
  const [page, setPage] = useState({ width: 0, index: 0 });
  const index = page.width === width ? page.index : 0;
  return (
    <View
      style={styles.hero}
      onLayout={event => {
        const layout = event.nativeEvent.layout;
        setDimensions({ width: layout.width, height: layout.height });
      }}
    >
      {hall.images.length && width ? (
        <FlatList
          key={width}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          data={hall.images}
          keyExtractor={photo => photo.id}
          onMomentumScrollEnd={event =>
            setPage({
              width,
              index: Math.round(event.nativeEvent.contentOffset.x / width),
            })
          }
          renderItem={({ item }) => (
            <View style={{ width, height }}>
              <HallPhoto uri={item.url} label={`Fotografie ${hall.name}`} />
            </View>
          )}
        />
      ) : (
        <HallPhoto uri={null} label={hall.name} />
      )}
      {hall.images.length ? (
        <View style={styles.photoCounter}>
          <Text style={styles.body}>
            {Math.min(index + 1, hall.images.length)} / {hall.images.length}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
