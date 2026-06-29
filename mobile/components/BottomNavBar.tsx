import React from "react";
import { View, Pressable, StyleSheet, Platform } from "react-native";
import { Home, User, MessageCircle, Search, Droplet } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
export type NavTab = "home" | "profile" | "chat" | "search" | "drops";

type BottomNavBarProps = {
  activeTab?: NavTab;
  onTabPress?: (tab: NavTab) => void;
};

const NAV_ITEMS: { tab: NavTab; Icon: React.FC<any> }[] = [
  { tab: "home", Icon: Home },
  { tab: "search", Icon: Search },
  { tab: "chat", Icon: MessageCircle },
  { tab: "drops", Icon: Droplet },
  { tab: "profile", Icon: User },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab = "home",
  onTabPress,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handlePress = (tab: NavTab) => {
    if (onTabPress) {
      onTabPress(tab);
      return;
    }

    switch (tab) {
      case "home":
        router.push("/(patient)/home");
        break;
      case "search":
        router.push("/(patient)/medicines");
        break;
      case "chat":
        router.push("/(patient)/chat");
        break;
      case "drops":
        router.push("/(patient)/blood-donation");
        break;
      case "profile":
        router.push("/(patient)/profile");
        break;
    }
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
      <View style={styles.container}>
        {NAV_ITEMS.map(({ tab, Icon }) => {
          const isActive = tab === activeTab;
          return (
            <Pressable
              key={tab}
              onPress={() => handlePress(tab)}
              style={({ pressed }) => [styles.tabBtn, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Icon
                size={28}
                color={isActive ? "#2B9C8E" : "#8A9AA9"}
                fill={isActive ? "#2B9C8E" : "none"}
                strokeWidth={isActive ? 2 : 1.8}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#F2F8F8", // Match the nav bar color so the bottom safe area is filled
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 8,
  },
  container: {
    flexDirection: "row",
    paddingVertical: 18,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    alignItems: "center",
  },
  tabBtn: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
});
