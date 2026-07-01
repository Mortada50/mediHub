import React from "react";
import {
    View,
    Text,
    Pressable,
    ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check } from "lucide-react-native";
import { useRouter } from "expo-router";

// ═══════════════════════════════════════════════════════════
//  Mock — registered donor data
// ═══════════════════════════════════════════════════════════

const DONOR_DATA = {
    fullName: "نادر مجيب محمد طريوش",
    city: "تعز - بيرباشا",
    phone: "717573332",
    bloodType: "O+",
};

// ═══════════════════════════════════════════════════════════
//  Data Row component
// ═══════════════════════════════════════════════════════════

type DataRowProps = {
    label: string;
    value: string;
    isBloodType?: boolean;
    isLast?: boolean;
};

const DataRow: React.FC<DataRowProps> = ({ label, value, isBloodType, isLast }) => (
    <View
        className={`flex-row items-center justify-between py-4 ${!isLast ? "border-b border-[#E4F0EF]" : ""
            }`}
    >
        <Text
            className="text-[13px] text-[#7A8A9A]"
            style={{ fontFamily: "Bein" }}
        >
            {label}
        </Text>
        <Text
            className={`text-[14px] ${isBloodType ? "text-[#F6655A]" : "text-gray-600"}`}
            style={{ fontFamily: isBloodType ? "Bein-Black" : "Bein" }}
        >
            {value}
        </Text>
    </View>
);

// ═══════════════════════════════════════════════════════════
//  Screen
// ═══════════════════════════════════════════════════════════

export default function SuccessScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const handleBack = () => {
        // Navigate back to index and mark as registered
        router.replace("/(patient)/blood-donation");
    };

    return (
        <View className="flex-1 bg-white">
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingTop: insets.top + 32,
                    paddingHorizontal: 20,
                    paddingBottom: insets.bottom + 24,
                    alignItems: "center",
                    justifyContent: "center",
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Success Icon ── */}
                <View className="w-[110px] h-[110px] rounded-full border-[3px] border-[#2B9C8E] items-center justify-center mb-5 bg-[#EAF5F4]">
                    <View className="w-[80px] h-[80px] rounded-full bg-[#2B9C8E] items-center justify-center">
                        <Check size={44} color="#fff" strokeWidth={2.5} />
                    </View>
                </View>

                {/* ── Headline ── */}
                <Text
                    className="text-[22px] text-gray-600 text-center mb-2"
                    style={{ fontFamily: "Bein-Black" }}
                >
                    أنت مسجل كمتبرع
                </Text>
                <Text
                    className="text-[14px] text-[#7A8A9A] text-center mb-10"
                    style={{ fontFamily: "Bein" }}
                >
                    شكراً لمساهمتك في إنقاذ الأرواح
                </Text>

                {/* ── Data Card ── */}
                <View className="bg-[#F4FAFA] rounded-[20px] px-5 border border-[#E4F0EF] w-full mb-10">
                    <DataRow label="الاسم الكامل" value={DONOR_DATA.fullName} />
                    <DataRow label="المدينة" value={DONOR_DATA.city} />
                    <DataRow label="الهاتف" value={DONOR_DATA.phone} />
                    <DataRow label="فصيلة الدم" value={DONOR_DATA.bloodType} isBloodType isLast />
                </View>

                {/* ── CTA ── */}
                <Pressable
                    onPress={handleBack}
                    className="bg-[#2B9C8E] rounded-[16px] h-[56px] items-center justify-center w-full"
                    style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                >
                    <Text
                        className="text-white text-[15px]"
                        style={{ fontFamily: "Bein-Black" }}
                    >
                        العودة لقائمة المتبرعين
                    </Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}