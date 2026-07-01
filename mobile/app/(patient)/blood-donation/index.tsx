import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Modal,
  Image,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Search,
  SlidersHorizontal,
  MessageCircle,
  Phone,
  MapPin,
  Droplets,
  HeartHandshake,
  Info,
  X,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { yemenGovernorates } from "@/utils/constant"

// ═══════════════════════════════════════════════════════════
//  Types
// ═══════════════════════════════════════════════════════════

type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

type Donor = {
  id: string;
  fullName: string;
  bloodType: BloodType;
  city: string;
  district: string;
};

// ═══════════════════════════════════════════════════════════
//  Mock Data
// ═══════════════════════════════════════════════════════════

const MOCK_DONORS: Donor[] = [
  { id: "1", fullName: "محمد عبد الولي التويج", bloodType: "O+", city: "تعز", district: "بيرباشا" },
  { id: "2", fullName: "يوسف أحمد سعيد", bloodType: "A+", city: "عدن", district: "حي المنصورة" },
  { id: "3", fullName: "خالد عبد الرحمن حسين", bloodType: "B+", city: "صنعاء", district: "حي شملان" },
  { id: "4", fullName: "سامي عبد الله محمد", bloodType: "O-", city: "تعز", district: "بيرباشا" },
  { id: "5", fullName: "أحمد علي الزبيدي", bloodType: "AB+", city: "تعز", district: "بيرباشا" },
  { id: "6", fullName: "عمر محمد الشرعبي", bloodType: "A-", city: "إب", district: "وسط المدينة" },
  { id: "7", fullName: "فيصل حسن الصبيحي", bloodType: "B-", city: "صنعاء", district: "حدة" },
  { id: "8", fullName: "ناصر عبد الكريم الحمدي", bloodType: "O+", city: "عدن", district: "كريتر" },
  { id: "9", fullName: "وليد أمين الأكحلي", bloodType: "A+", city: "الحديدة", district: "الهالي" },
  { id: "10", fullName: "سعيد علي الجعدبي", bloodType: "AB-", city: "الحديدة", district: "الكورنيش" },
  { id: "11", fullName: "محمود إبراهيم الربيعي", bloodType: "B+", city: "إب", district: "ذو السفال" },
  { id: "12", fullName: "طارق محمد المقطري", bloodType: "O-", city: "صنعاء", district: "السبعين" },
];

const CITIES = [...yemenGovernorates, "الكل"];
const BLOOD_TYPES: (BloodType | "الكل")[] = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-", "الكل"];

// ═══════════════════════════════════════════════════════════
//  Mock current patient (simulate logged-in user)
// ═══════════════════════════════════════════════════════════

const CURRENT_PATIENT = {
  fullName: "نادر مجيب محمد طريوش",
  phone: "717573332",
  city: "تعز",
  district: "بيرباشا",
  bloodType: "O+" as BloodType,
};

// ═══════════════════════════════════════════════════════════
//  Donor Card
// ═══════════════════════════════════════════════════════════

type DonorCardProps = { donor: Donor };

const DonorCard: React.FC<DonorCardProps> = ({ donor }) => (
  <View className="bg-[#F4FAFA] rounded-[20px] px-2 py-3 mb-3 flex-row items-center gap-2 border border-[#E4F0EF]">
    {/* Avatar */}
    <View className="w-[60px] h-[60px] rounded-full overflow-hidden bg-[#EAF5F4] items-center justify-center ml-3">
      <Image
        source={require("../../../assets/images/blood-doner-avatar.png")}
        className="w-full h-full"
        resizeMode="cover"
      />
    </View>

    {/* Info */}
    <View className="flex-1 items-start">
      <Text
        className="text-[15px] text-gray-600 mb-1"
        style={{ fontFamily: "Bein-Black" }}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {donor.fullName}
      </Text>
      <View className="flex-row-reverse items-center gap-2">
        <View className="bg-[#FCD9D6] h-[25px] w-[38px] rounded-full items-center">
          <Text className="text-[13px] text-[#F44336]" style={{ fontFamily: "Bein" }}>
          {donor.bloodType}
        </Text></View>
        <View className="flex-row-reverse items-center gap-1">
          <Text className="text-[12px] text-[#7A8A9A]" style={{ fontFamily: "Bein" }}>
            {donor.city} - {donor.district}
          </Text>
          <MapPin size={12} color="#2B9C8E" />
        </View>
      </View>
    </View>

    {/* Actions */}
    <View className="flex-col gap-2 mr-3">
      <Pressable
        className="w-[38px] h-[38px] rounded-full bg-[#2B9C8E] items-center justify-center"
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
      >
        <MessageCircle size={17} color="#fff" />
      </Pressable>
      <Pressable
        className="w-[38px] h-[38px] rounded-full bg-[#EAF5F4] items-center justify-center"
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
      >
        <Phone size={17} color="#2B9C8E" />
      </Pressable>
    </View>
  </View>
);

// ═══════════════════════════════════════════════════════════
//  Screen
// ═══════════════════════════════════════════════════════════

export default function BloodDonationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCity, setSelectedCity] = useState("الكل");
  const [selectedBloodType, setSelectedBloodType] = useState<BloodType | "الكل">("الكل");
  const [appliedCity, setAppliedCity] = useState("الكل");
  const [appliedBloodType, setAppliedBloodType] = useState<BloodType | "الكل">("الكل");
  const [isRegistered, setIsRegistered] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const filteredDonors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return MOCK_DONORS.filter((d) => {
      const matchCity = appliedCity === "الكل" || d.city === appliedCity;
      const matchBlood = appliedBloodType === "الكل" || d.bloodType === appliedBloodType;
      const matchSearch = !q || d.fullName.includes(q) || d.city.includes(q);
      return matchCity && matchBlood && matchSearch;
    });
  }, [searchQuery, appliedCity, appliedBloodType]);

  const handleRegisterPress = () => {
    const { fullName, phone, city, bloodType } = CURRENT_PATIENT;
    const isComplete = !!(fullName && phone && city && bloodType);
    if (isComplete) {
      router.push("/(patient)/blood-donation/register-donor");
    } else {
      router.push("/(patient)/blood-donation/complete-profile");
    }
  };

  const handleApplyFilter = () => {
    setAppliedCity(selectedCity);
    setAppliedBloodType(selectedBloodType);
    setShowFilters(false);
  };

  const handleResetFilter = () => {
    setSelectedCity("الكل");
    setSelectedBloodType("الكل");
    setAppliedCity("الكل");
    setAppliedBloodType("الكل");
  };

  const handleConfirmRemove = () => {
    setIsRegistered(false);
    setShowRemoveModal(false);
  };

  return (
    <View className="flex-1 bg-white">
      {/* ══════════ HEADER ══════════ */}
      <View
        className="bg-[#2B9C8E] px-5 pb-6"
        style={{ paddingTop: insets.top + 16 }}
      >
        {/* Title row */}
        <View className="flex-row-reverse items-center justify-end gap-3 mb-3">
          <Text
            className="text-[22px] text-white"
            style={{ fontFamily: "Bein-Black" }}
          >
            تبرع بالدم، وأنقذ حياة
          </Text>
          <Droplets size={28} color="#fff" />
        </View>
        {/* Ayah */}
        <Text
          className="text-[13px] text-white/80 text-center"
          style={{ fontFamily: "Bein" }}
        >
          ﴿َومن أحياها فكأنما أحيى الناس جميعاً﴾
        </Text>
        <Text
          className="text-[11px] text-white/60 text-center mt-1"
          style={{ fontFamily: "Bein" }}
        >
          سورة المائدة - الآية 32
        </Text>
      </View>

      <FlatList
        data={filteredDonors}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 24,
          paddingTop: 16,
        }}
        ListHeaderComponent={
          <View>
            {/* ── Search ── */}
            <View className="flex-row items-center bg-[#F4FAFA] rounded-[18px] px-4 h-[52px] mb-4 border border-[#E4F0EF]">
              <Search size={18} color="#2B9C8E" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="بحث عن متبرع"
                placeholderTextColor="#9ABAB7"
                className="flex-1 text-right text-[14px] text-[#1A2332] mr-3"
                style={{ fontFamily: "Bein" }}
              />
            </View>

            {/* ── Action Buttons Row ── */}
            <View className="flex-row-reverse gap-3 mb-4">
              {/* Register / Remove button */}
              <Pressable
                onPress={() =>
                  isRegistered ? setShowRemoveModal(true) : handleRegisterPress()
                }
                className="flex-1 bg-[#2B9C8E] rounded-[14px] h-[48px] flex-row-reverse items-center justify-center gap-2"
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
              >
                <Text
                  className="text-white text-[13px]"
                  style={{ fontFamily: "Bein-Black" }}
                >
                  {isRegistered ? "إزالتي من قائمة المتبرعين" : "سجل نفسك كمتبرع"}
                </Text>
                <HeartHandshake size={18} color="#fff" />
              </Pressable>

              {/* Filter button */}
              <Pressable
                onPress={() => setShowFilters((p) => !p)}
                className={`h-[48px] px-4 rounded-[14px] flex-row-reverse items-center justify-center gap-2 border ${showFilters
                    ? "bg-[#2B9C8E] border-[#2B9C8E]"
                    : "bg-white border-[#2B9C8E]"
                  }`}
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
              >
                <Text
                  className={`text-[13px] ${showFilters ? "text-white" : "text-[#2B9C8E]"}`}
                  style={{ fontFamily: "Bein-Black" }}
                >
                  فلتره
                </Text>
                <SlidersHorizontal
                  size={18}
                  color={showFilters ? "#fff" : "#2B9C8E"}
                />
              </Pressable>
            </View>

            {/* ── Filter Panel ── */}
            {showFilters && (
              <View className="bg-[#F4FAFA] rounded-[18px] p-4 mb-4 border border-[#E4F0EF]">
                {/* City filter */}
                <Text
                  className="text-[13px] text-[#1A2332] mb-2"
                  style={{ fontFamily: "Bein-Black" }}
                >
                  المدينة
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8, flexDirection: "row-reverse", paddingBottom: 4 }}
                  className="mb-4"
                >
                  {CITIES.map((city) => {
                    const isActive = city === selectedCity;
                    return (
                      <Pressable
                        key={city}
                        onPress={() => setSelectedCity(city)}
                        className={`px-4 h-[34px] rounded-full items-center justify-center border ${isActive
                            ? "bg-[#2B9C8E] border-[#2B9C8E]"
                            : "bg-white border-[#C5DCE0]"
                          }`}
                      >
                        <Text
                          className={`text-[12px] ${isActive ? "text-white" : "text-[#2B9C8E]"}`}
                          style={{ fontFamily: "Bein-Black" }}
                        >
                          {city}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                {/* Blood type filter */}
                <Text
                  className="text-[13px] text-[#1A2332] mb-2"
                  style={{ fontFamily: "Bein-Black" }}
                >
                  فصيلة الدم
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8, flexDirection: "row-reverse", paddingBottom: 4 }}
                  className="mb-5"
                >
                  {BLOOD_TYPES.map((bt) => {
                    const isActive = bt === selectedBloodType;
                    return (
                      <Pressable
                        key={bt}
                        onPress={() => setSelectedBloodType(bt)}
                        className={`px-4 h-[34px] rounded-full items-center justify-center border ${isActive
                          ? "bg-[#2B9C8E] border-[#2B9C8E]"
                            : "bg-white border-[#C5DCE0]"
                          }`}
                      >
                        <Text
                          className={`text-[12px] ${isActive ? "text-white" : "text-[#5C6B7A]"}`}
                          style={{ fontFamily: "Bein-Black" }}
                        >
                          {bt}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                {/* Apply / Reset */}
                <View className="flex-row-reverse gap-3">
                  <Pressable
                    onPress={handleResetFilter}
                    className="flex-1 bg-white border border-[#C5DCE0] rounded-[12px] h-[44px] items-center justify-center"
                    style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                  >
                    <Text
                      className="text-[#5C6B7A] text-[13px]"
                      style={{ fontFamily: "Bein-Black" }}
                    >
                      إعادة تعيين
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleApplyFilter}
                    className="flex-1 bg-[#2B9C8E] rounded-[12px] h-[44px] items-center justify-center"
                    style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                  >
                    <Text
                      className="text-white text-[13px]"
                      style={{ fontFamily: "Bein-Black" }}
                    >
                      تطبيق الفلتر
                    </Text>
                  </Pressable>
                  
                </View>
              </View>
            )}

            {/* ── Count ── */}
            <Text
              className="text-[13px] text-[#7A8A9A] mb-3"
              style={{ fontFamily: "Bein" }}
            >
              {filteredDonors.length} - متبرع متاح
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-16">
            <Droplets size={40} color="#C5DCE0" />
            <Text
              className="text-[14px] text-[#9ABAB7] mt-3"
              style={{ fontFamily: "Bein" }}
            >
              لا توجد نتائج مطابقة
            </Text>
          </View>
        }
        renderItem={({ item }) => <DonorCard donor={item} />}
      />

      {/* ══════════ REMOVE MODAL ══════════ */}
      <Modal
        visible={showRemoveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRemoveModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 items-center justify-center px-6"
          onPress={() => setShowRemoveModal(false)}
        >
          <Pressable
            className="bg-white rounded-[24px] w-full p-6 items-center"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <View className="w-[56px] h-[56px] rounded-full border-2 border-[#E02020] items-center justify-center mb-4">
              <Info size={26} color="#E02020" />
            </View>

            <Text
              className="text-[18px] text-[#1A2332] text-center mb-2"
              style={{ fontFamily: "Bein-Black" }}
            >
              إزالة من قائمة المتبرعين؟
            </Text>
            <Text
              className="text-[13px] text-[#7A8A9A] text-center mb-6 leading-6"
              style={{ fontFamily: "Bein" }}
            >
              لن يظهر اسمك بعد الآن للمرضى الباحثين عن متبرع. ويمكنك التسجيل مجدداً في أي وقت
            </Text>

            <View className="flex-row-reverse gap-3 w-full">
              <Pressable
                onPress={handleConfirmRemove}
                className="flex-1 bg-[#E02020] rounded-[14px] h-[50px] items-center justify-center"
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
              >
                <Text
                  className="text-white text-[15px]"
                  style={{ fontFamily: "Bein-Black" }}
                >
                  تأكيد
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setShowRemoveModal(false)}
                className="flex-1 bg-[#F4FAFA] rounded-[14px] h-[50px] items-center justify-center border border-[#E4F0EF]"
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
              >
                <Text
                  className="text-[#5C6B7A] text-[15px]"
                  style={{ fontFamily: "Bein-Black" }}
                >
                  تراجع
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}