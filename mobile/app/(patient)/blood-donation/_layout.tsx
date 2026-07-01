import React from "react";
import { Stack } from "expo-router";

export default function BloodDonationLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="complete-profile" />
      <Stack.Screen name="register-donor" />
      <Stack.Screen name="success" />
    </Stack>
  );
}