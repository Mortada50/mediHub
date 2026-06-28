import { Text, View } from "react-native";
export default function Index() {
  return (
    <View
      className="flex-1 justify-center items-center bg-background"
    >
      <Text className="text-primary font-bein text-2xl mb-4">مرحباً بك في ميدي هب</Text>
      <View className="bg-primary px-6 py-3 rounded-xl shadow-sm">
        <Text className="text-background-white font-bein text-lg">زر تجريبي باللون الأساسي</Text>
      </View>
    </View>
  );
}
