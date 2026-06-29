import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Image,
  FlatList,
  Dimensions,
  StyleSheet,
  ViewToken,
  Animated,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HORIZONTAL_PADDING = 20;
const ITEM_GAP = 20;
const CARD_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;
const BANNER_HEIGHT = 185;
const SNAP_INTERVAL = CARD_WIDTH + ITEM_GAP;

export type BannerItem = {
  id: string;
  image: any;
};

type BannerSliderProps = {
  items: BannerItem[];
  autoPlayInterval?: number;
};

const Dot = ({ isActive }: { isActive: boolean }) => {
  const anim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: isActive ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isActive]);

  const width = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [7, 24],
  });

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#C5DDD9", "#2B9C8E"],
  });

  return <Animated.View style={[styles.dot, { width, backgroundColor }]} />;
};

export const BannerSlider: React.FC<BannerSliderProps> = ({
  items,
  autoPlayInterval = 3500,
}) => {
  const extendedItems = [...items, { ...items[0], id: `${items[0].id}-clone` }];
  
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const visualIndexRef = useRef(0);

  const startAutoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      let next = visualIndexRef.current + 1;
      
      // Failsafe in case of out of bounds
      if (next >= extendedItems.length) {
        flatListRef.current?.scrollToIndex({ index: 0, animated: false });
        visualIndexRef.current = 0;
        next = 1;
      }

      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      visualIndexRef.current = next;

      // Update dot indicator (if clone, show first dot)
      setActiveIndex(next === extendedItems.length - 1 ? 0 : next);

      // If we animated to the clone, silently jump back to the start after animation finishes
      if (next === extendedItems.length - 1) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index: 0, animated: false });
          visualIndexRef.current = 0;
        }, 400);
      }
    }, autoPlayInterval);
  };

  useEffect(() => {
    startAutoPlay();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [items.length]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        const idx = viewableItems[0].index;
        visualIndexRef.current = idx;
        setActiveIndex(idx === extendedItems.length - 1 ? 0 : idx);
      }
    }
  ).current;

  const onMomentumScrollEnd = () => {
    startAutoPlay();
    // If user manually swiped to the clone, silently jump back to start
    if (visualIndexRef.current === extendedItems.length - 1) {
      flatListRef.current?.scrollToIndex({ index: 0, animated: false });
      visualIndexRef.current = 0;
    }
  };

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={extendedItems}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="center"
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: SNAP_INTERVAL,
          offset: SNAP_INTERVAL * index,
          index,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScrollBeginDrag={() => { if (intervalRef.current) clearInterval(intervalRef.current); }}
        onScrollEndDrag={startAutoPlay}
        onMomentumScrollEnd={onMomentumScrollEnd}
        contentContainerStyle={{ paddingHorizontal: HORIZONTAL_PADDING, paddingVertical: 10 }}
        ItemSeparatorComponent={() => <View style={{ width: ITEM_GAP }} />}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={item.image} style={styles.image} resizeMode="stretch" />
          </View>
        )}
      />
      {/* Dot Indicators */}
      <View style={styles.dotsContainer}>
        {items.map((_, index) => (
          <Dot key={index} isActive={index === activeIndex} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    width: CARD_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    gap: 6,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
});
