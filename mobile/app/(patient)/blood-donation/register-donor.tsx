import React, { useState } from "react";
import {
    View,
    Text,
    Pressable,
    ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    ArrowRight,
    User,
    MapPin,
    Phone,
    Droplets,
    CheckSquare,
    Square,
    ShieldCheck,
} from "lucide-react-native";
import { useRouter } from "expo-router";

// ═══════════════════════════════════════════════════════════
//  Mock — complete patient data (arrived from complete-profile or index)
// ═══════════════════════════════════════════════════════════

const PATIENT_DATA = {
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

export default function RegisterDonorScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [agreed, setAgreed] = useState(false);

    const handleConfirm = () => {
        router.replace("/(patient)/blood-donation/success");
    };

    return (
        <View className="flex-1 bg-white">
            {/* ══════════ HEADER ══════════ */}
            <View
                className="bg-[#2B9C8E] px-5 pb-6"
                style={{ paddingTop: insets.top + 12 }}
            >
                <View className="flex-row items-start justify-start mb-3 gap-3">
                    <Pressable
                        onPress={() => router.back()}
                        className="w-[40px] h-[40px] rounded-full bg-white/20 items-center justify-center"
                        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    >
                        <ArrowRight size={20} color="#fff" />
                    </Pressable>
                    <Text
                        className="text-[20px] text-white"
                        style={{ fontFamily: "Bein-Black" }}
                    >
                        سجل كمتبرع بالدم
                    </Text>
                </View>
                <Text
                    className="text-[12px] text-white/75"
                    style={{ fontFamily: "Bein" }}
                >
                    بياناتك الأساسية مكتملة. يمكنك التسجيل في قائمة المتبرعين الآن.
                </Text>
            </View>

            {/* ══════════ CONTENT ══════════ */}
            <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Data Card ── */}
                <View className="bg-[#F4FAFA] rounded-[20px] px-5 border border-[#E4F0EF] mb-6">
                    <DataRow label="الاسم الكامل" value={PATIENT_DATA.fullName} />
                    <DataRow label="المدينة" value={PATIENT_DATA.city} />
                    <DataRow label="الهاتف" value={PATIENT_DATA.phone} />
                    <DataRow label="فصيلة الدم" value={PATIENT_DATA.bloodType} isBloodType isLast />
                </View>

                {/* ── Consent Box ── */}
                <Pressable
                    onPress={() => setAgreed((p) => !p)}
                    className="flex-row-reverse items-start gap-3 bg-[#F4FAFA] rounded-[16px] p-4 border border-[#E4F0EF] mb-8"
                    style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                >
                    <Text
                        className="flex-1 text-[12px] text-[#5C6B7A] leading-6"
                        style={{ fontFamily: "Bein" }}
                    >
                        أوافق على ظهور بياناتي للمرضى الباحثين عن متبرع، والتواصل معي عند الحاجة.
                    </Text>
                    <View className="mt-0.5">
                        {agreed ? (
                            <CheckSquare size={22} color="#2B9C8E" />
                        ) : (
                            <Square size={22} color="#9ABAB7" />
                        )}
                    </View>
                </Pressable>

                {/* ── Info note ── */}
                <View className="flex-row-reverse items-start gap-2 mb-6 px-1">
                    <Text
                        className="flex-1 text-[12px] text-[#9ABAB7] leading-5"
                        style={{ fontFamily: "Bein" }}
                    >
                        بياناتك محمية ولن تستخدم إلا للتواصل في حالات الطوارئ الطبية فقط.
                    </Text>
                    <ShieldCheck size={16} color="#2B9C8E" style={{ marginTop: 2 }} />
                </View>

                {/* ── Confirm Button ── */}
                <Pressable
                    onPress={handleConfirm}
                    disabled={!agreed}
                    className={`rounded-[16px] h-[56px] items-center justify-center ${agreed ? "bg-[#2B9C8E]" : "bg-[#B8D9D6]"
                        }`}
                    style={({ pressed }) => [{ opacity: pressed && agreed ? 0.85 : 1 }]}
                >
                    <Text
                        className="text-white text-[15px]"
                        style={{ fontFamily: "Bein-Black" }}
                    >
                        تأكيد التسجيل كمتبرع
                    </Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}