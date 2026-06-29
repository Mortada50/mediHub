import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { MapPin } from "lucide-react-native";

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  location: string;
  image: any;
};

type DoctorCardProps = {
  doctor: Doctor;
  onPress?: () => void;
};

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
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
      <View
        className="w-[74px] h-[74px] rounded-full overflow-hidden bg-[#EAF5F4] mb-3 border-[3px] border-[#D0EDEA]"
      >
        <Image
          source={doctor.image}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      {/* Name */}
      <Text
        numberOfLines={1}
        className="text-[13px] text-[#1A2332] text-center mb-1"
        style={{ fontFamily: "Bein-Black" }}
      >
        {doctor.name}
      </Text>

      {/* Specialty */}
      <Text
        numberOfLines={1}
        className="text-[11px] text-[#7A8A9A] text-center mb-2"
        style={{ fontFamily: "Bein" }}
      >
        {doctor.specialty}
      </Text>

      {/* Location */}
      <View className="flex-row items-center gap-1">
        <MapPin size={12} color="#2B9C8E" />
        <Text
          numberOfLines={1}
          className="text-[11px] text-[#2B9C8E] text-right"
          style={{ fontFamily: "Bein" }}
        >
          {doctor.location}
        </Text>

      </View>
    </Pressable>
  );
};