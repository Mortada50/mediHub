import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { ChevronLeft } from "lucide-react-native";

type SectionHeaderProps = {
  title: string;
  onPressAll?: () => void;
};

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, onPressAll }) => {
  return (
    <View style={styles.row}>
      {/* Right: Title (RTL — this is on the right since flexDirection row-reverse is used) */}
      <Text style={styles.title}>{title}</Text>

      {/* Left: "View All" button */}
      {onPressAll && (
        <Pressable
          onPress={onPressAll}
          style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={styles.btnText} >عرض الكل</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontFamily: "Bein-Black",
    fontSize: 19,
    color: "#1A2332",
    textAlign: "right",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    
    gap: 2,
  },
  btnText: {
    fontFamily: "Bein",
    fontSize: 13,
    color: "#2B9C8E",
  },
});
