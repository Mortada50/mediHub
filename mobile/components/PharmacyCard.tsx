import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { MapPin } from "lucide-react-native";

export type Pharmacy = {
  id: string;
  name: string;
  isOpen: boolean;
  location: string;
  image: any;
};

type PharmacyCardProps = {
  pharmacy: Pharmacy;
  onPress?: () => void;
};

export const PharmacyCard: React.FC<PharmacyCardProps> = ({
  pharmacy,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      className="w-[130px] bg-white rounded-[20px] px-3 py-4 items-center border border-[#EBF5F4]"
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.92 : 1,
          shadowColor: "#2B9C8E",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
          elevation: 3,
        },
      ]}
    >
      {/* Avatar */}
      <View className="w-[74px] h-[74px] rounded-full overflow-hidden bg-[#EAF5F4] mb-3 border-[3px] border-[#D0EDEA]">
        <Image
          source={pharmacy.image}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      {/* Name */}
      <Text
        numberOfLines={1}
        className="text-[13px] text-[#1A2332] text-center mb-2"
        style={{ fontFamily: "Bein-Black" }}
      >
        {pharmacy.name}
      </Text>

      {/* Open / Closed Badge */}
      <View
        className={`px-[10px] py-1 rounded-full mb-[10px] ${pharmacy.isOpen ? "bg-[#D1FAE5]" : "bg-[#FEE2E2]"
          }`}
      >
        <Text
          className={`text-[10px] ${pharmacy.isOpen ? "text-[#059669]" : "text-[#DC2626]"
            }`}
          style={{ fontFamily: "Bein" }}
        >
          {pharmacy.isOpen ? "مفتوح الآن" : "مغلق الآن"}
        </Text>
      </View>

      {/* Location */}
      <View className="flex-row items-center gap-1">
        <MapPin size={12} color="#2B9C8E" />
        <Text
          numberOfLines={1}
          className="text-[11px] text-[#2B9C8E] text-right"
          style={{ fontFamily: "Bein" }}
        >
          {pharmacy.location}
        </Text>

      </View>
    </Pressable>
  );
};