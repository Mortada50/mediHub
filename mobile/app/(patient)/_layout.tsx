import React from "react";
import { Tabs } from "expo-router";
import { BottomNavBar } from "../../components/BottomNavBar";

export default function PatientLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => {
        const routeName = props.state.routes[props.state.index].name;
        
        let activeTab = "home";
        if (routeName === "profile") activeTab = "profile";
        else if (routeName === "chat") activeTab = "chat";
        else if (routeName === "blood-donation") activeTab = "drops";
        else if (routeName === "medicines") activeTab = "search";

        return (
          <BottomNavBar 
            activeTab={activeTab as any}
            onTabPress={(tab) => {
              switch (tab) {
                case "home":
                  props.navigation.navigate("home");
                  break;
                case "search":
                  props.navigation.navigate("medicines");
                  break;
                case "chat":
                  props.navigation.navigate("chat");
                  break;
                case "drops":
                  props.navigation.navigate("blood-donation");
                  break;
                case "profile":
                  props.navigation.navigate("profile");
                  break;
              }
            }}
          />
        );
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="medicines" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="blood-donation" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
