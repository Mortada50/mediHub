import React, { useState } from "react";

import {

    View,

    Text,

    TextInput,

    Pressable,

    ScrollView,

    Modal,

} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import {

    ArrowRight,

    User,

    Phone,

    MapPin,

    Droplets,

    ChevronDown,

    Check,

} from "lucide-react-native";

import { useRouter } from "expo-router";
import { yemenGovernorates } from "@/utils/constant";



// ═══════════════════════════════════════════════════════════

//  Types & Constants

// ═══════════════════════════════════════════════════════════



type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";



const CITIES = yemenGovernorates;

const BLOOD_TYPES: BloodType[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];



// ─── Mock: simulate partial patient data (missing city & bloodType) ───

const EXISTING_PATIENT = {

    fullName: "نادر مجيب محمد طريوش",

    phone: "717573332",

    city: "",          // missing

    district: "",      // missing

    bloodType: "" as BloodType | "",  // missing

};



// ═══════════════════════════════════════════════════════════

//  Dropdown component

// ═══════════════════════════════════════════════════════════



type DropdownProps = {

    label: string;

    placeholder: string;

    value: string;

    options: string[];

    icon?: React.ReactNode;

    onSelect: (val: string) => void;

};



const Dropdown: React.FC<DropdownProps> = ({

    label,

    placeholder,

    value,

    options,

    icon,

    onSelect,

}) => {

    const [open, setOpen] = useState(false);



    return (

        <>

            <View className="mb-5">

                {/* Label */}

                <View className="flex-row items-center gap-2 mb-2">

                    {icon}

                    <Text

                        className="text-[13px] text-[#1A2332]"

                        style={{ fontFamily: "Bein-Black" }}

                    >

                        {label}

                    </Text>

                </View>

                {/* Trigger */}

                <Pressable

                    onPress={() => setOpen(true)}

                    className="flex-row-reverse items-center justify-between bg-[#F4FAFA] border border-[#E4F0EF] rounded-[14px] px-4 h-[52px]"

                    style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}

                >

                    <Text

                        className={`text-[14px] ${value ? "text-[#1A2332]" : "text-[#9ABAB7]"}`}

                        style={{ fontFamily: "Bein" }}

                    >

                        {value || placeholder}

                    </Text>

                    <ChevronDown size={18} color="#7A8A9A" />

                </Pressable>

            </View>



            {/* Modal picker */}

            <Modal visible={open} transparent animationType="slide">

                <Pressable

                    className="flex-1 bg-black/40 justify-end"

                    onPress={() => setOpen(false)}

                >

                    <Pressable

                        className="bg-white rounded-t-[24px] pb-8"

                        onPress={(e) => e.stopPropagation()}

                    >

                        <View className="flex-row-reverse items-center justify-between px-5 py-4 border-b border-[#F0F5F5]">

                            <Text

                                className="text-[16px] text-[#1A2332]"

                                style={{ fontFamily: "Bein-Black" }}

                            >

                                {label}

                            </Text>

                            <Pressable onPress={() => setOpen(false)}>

                                <Text

                                    className="text-[13px] text-[#2B9C8E]"

                                    style={{ fontFamily: "Bein" }}

                                >

                                    إغلاق

                                </Text>

                            </Pressable>

                        </View>

                        <ScrollView>

                            {options.map((opt) => (

                                <Pressable

                                    key={opt}

                                    onPress={() => { onSelect(opt); setOpen(false); }}

                                    className="flex-row-reverse items-center justify-between px-5 py-4 border-b border-[#F4FAFA]"

                                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}

                                >

                                    <Text

                                        className={`text-[15px] ${value === opt ? "text-[#2B9C8E]" : "text-[#1A2332]"}`}

                                        style={{ fontFamily: value === opt ? "Bein-Black" : "Bein" }}

                                    >

                                        {opt}

                                    </Text>

                                    {value === opt && <Check size={18} color="#2B9C8E" />}

                                </Pressable>

                            ))}

                        </ScrollView>

                    </Pressable>

                </Pressable>

            </Modal>

        </>

    );

};



// ═══════════════════════════════════════════════════════════

//  Input Field component

// ═══════════════════════════════════════════════════════════



type InputFieldProps = {

    label: string;

    placeholder: string;

    value: string;

    onChangeText: (t: string) => void;

    icon?: React.ReactNode;

    keyboardType?: "default" | "phone-pad";

};



const InputField: React.FC<InputFieldProps> = ({

    label,

    placeholder,

    value,

    onChangeText,

    icon,

    keyboardType = "default",

}) => (

    <View className="mb-5">

        <View className="flex-row items-center gap-2 mb-2">

            {icon}

            <Text

                className="text-[13px] text-gray-600"

                style={{ fontFamily: "Bein-Black" }}

            >

                {label}

            </Text>

        </View>

        <TextInput

            value={value}

            onChangeText={onChangeText}

            placeholder={placeholder}

            placeholderTextColor="#9ABAB7"

            keyboardType={keyboardType}

            className="bg-[#F4FAFA] border border-[#E4F0EF] rounded-[14px] px-4 h-[52px]  text-[14px] text-gray-600"

            style={{ fontFamily: "Bein" }}

        />

    </View>

);



// ═══════════════════════════════════════════════════════════
//  Read-Only Field component (للحقول الموجودة مسبقاً)
// ═══════════════════════════════════════════════════════════

type ReadOnlyFieldProps = {

    label: string;

    value: string;

    icon?: React.ReactNode;

};



const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({ label, value, icon }) => (

    <View className="mb-5">

        <View className="flex-row-reverse items-center gap-2 mb-2">

            {icon}

            <Text

                className="text-[13px] text-[#1A2332]"

                style={{ fontFamily: "Bein-Black" }}

            >

                {label}

            </Text>

        </View>

        <View className="bg-[#EDF6F5] border border-[#D4EAE8] rounded-[14px] px-4 h-[52px] justify-center">

            <Text

                className="text-right text-[14px] text-[#5C6B7A]"

                style={{ fontFamily: "Bein" }}

            >

                {value}

            </Text>

        </View>

    </View>

);



// ═══════════════════════════════════════════════════════════

//  Screen

// ═══════════════════════════════════════════════════════════



export default function CompleteProfileScreen() {

    const insets = useSafeAreaInsets();

    const router = useRouter();



    // Pre-fill existing data, only show missing fields

    const [fullName, setFullName] = useState(EXISTING_PATIENT.fullName);

    const [phone, setPhone] = useState(EXISTING_PATIENT.phone);

    const [city, setCity] = useState(EXISTING_PATIENT.city);

    const [district, setDistrict] = useState(EXISTING_PATIENT.district);

    const [bloodType, setBloodType] = useState<BloodType | "">(EXISTING_PATIENT.bloodType);



    const needsName = !EXISTING_PATIENT.fullName;

    const needsPhone = !EXISTING_PATIENT.phone;

    const needsCity = !EXISTING_PATIENT.city;

    const needsDistrict = !EXISTING_PATIENT.district;

    const needsBloodType = !EXISTING_PATIENT.bloodType;



    const canProceed =

        (!needsName || fullName.trim().length >= 2) &&

        (!needsPhone || phone.trim().length >= 9) &&

        (!needsCity || city !== "") &&

        (!needsBloodType || bloodType !== "");



    const handleContinue = () => {

        router.push("/(patient)/blood-donation/register-donor");

    };



    return (

        <View className="flex-1 bg-white">

            {/* ══════════ HEADER ══════════ */}

            <View

                className="bg-[#2B9C8E] px-5 pb-6"

                style={{ paddingTop: insets.top + 12 }}

            >

                <View className="flex-row items-center justify-start gap-3 mb-3">

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

                        أكمل بياناتك أولاً

                    </Text>

                </View>

                <Text

                    className="text-[13px] text-white/75"

                    style={{ fontFamily: "Bein" }}

                >

                    لتتمكن من التسجيل كمتبرع بالدم، يجب إكمال البيانات الأساسية التالية.

                </Text>

            </View>



            {/* ══════════ FORM ══════════ */}

            <ScrollView

                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}

                showsVerticalScrollIndicator={false}

                keyboardShouldPersistTaps="handled"

            >

                <View className="bg-[#F4FAFA] rounded-[20px] p-5 border border-[#E4F0EF] mb-6">

                    {/* ── الاسم الكامل — يظهر دائماً قابلاً للتعديل ── */}

                    <InputField

                        label="الاسم الكامل"

                        placeholder="أدخل اسمك الكامل"

                        value={fullName}

                        onChangeText={setFullName}

                        icon={<User size={16} color="#2B9C8E" />}

                    />

                    {/* ── رقم الهاتف — يظهر دائماً قابلاً للتعديل ── */}

                    <InputField

                        label="رقم الهاتف"

                        placeholder="7XXXXXXXX"

                        value={phone}

                        onChangeText={setPhone}

                        keyboardType="phone-pad"

                        icon={<Phone size={16} color="#2B9C8E" />}

                    />

                    {/* City & District — side by side if both needed, else full width */}

                    {(needsCity || needsDistrict) && (

                        <View className="flex-row-reverse gap-3">

                            {needsCity && (

                                <View className="flex-1">

                                    <Dropdown

                                        label="المدينة"

                                        placeholder="اختر المحافظة"

                                        value={city}

                                        options={CITIES}

                                        icon={<MapPin size={16} color="#2B9C8E" />}

                                        onSelect={setCity}

                                    />

                                </View>

                            )}

                            {needsDistrict && (

                                <View className="flex-1">

                                    <InputField

                                        label="الحي / الشارع"

                                        placeholder="الحي أو الشارع"

                                        value={district}

                                        onChangeText={setDistrict}

                                        icon={<MapPin size={16} color="#2B9C8E" />}

                                    />

                                </View>

                            )}

                        </View>

                    )}



                    {/* Blood Type */}

                    {needsBloodType && (

                        <Dropdown

                            label="فصيلة الدم"

                            placeholder="اختر الفصيلة"

                            value={bloodType}

                            options={BLOOD_TYPES}

                            icon={<Droplets size={16} color="#2B9C8E" />}

                            onSelect={(v) => setBloodType(v as BloodType)}

                        />

                    )}



                    {/* If user already has everything — shouldn't reach here, but guard */}

                    {!needsName && !needsPhone && !needsCity && !needsDistrict && !needsBloodType && (

                        <Text

                            className="text-[14px] text-[#2B9C8E] text-center py-4"

                            style={{ fontFamily: "Bein" }}

                        >

                            بياناتك مكتملة ✓

                        </Text>

                    )}

                </View>



                {/* ── CTA Button ── */}

                <Pressable

                    onPress={handleContinue}

                    disabled={!canProceed}

                    className={`rounded-[16px] h-[56px] items-center justify-center ${canProceed ? "bg-[#2B9C8E]" : "bg-[#B8D9D6]"

                        }`}

                    style={({ pressed }) => [{ opacity: pressed && canProceed ? 0.85 : 1 }]}

                >

                    <Text

                        className="text-white text-[15px]"

                        style={{ fontFamily: "Bein-Black" }}

                    >

                        المتابعة وإكمال التسجيل

                    </Text>

                </Pressable>

            </ScrollView>

        </View>

    );

}