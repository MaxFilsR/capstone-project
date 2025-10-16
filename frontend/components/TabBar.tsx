import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import { colorPallet } from "@/styles/variables";
import { tabStyles, typography } from "@/styles";

export interface Tab {
  name: string;
  component: React.ComponentType<any>;
}

interface TabBarProps {
  pageTitle?: string;
  tabs: Tab[];
  initialTab?: number;
  onTabChange?: (index: number) => void;
  tabBarStyle?: ViewStyle;
  activeTabColor?: string;
  inactiveTabColor?: string;
  activeTextColor?: string;
  inactiveTextColor?: string;
}

const TabBar: React.FC<TabBarProps> = ({
  pageTitle,
  tabs,
  initialTab = 0,
  onTabChange,
  tabBarStyle,
  activeTabColor = colorPallet.primary,
  inactiveTabColor = "transparent",
  activeTextColor = "#000000",
  inactiveTextColor = "#FFFFFF",
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabPress = (index: number) => {
    setActiveTab(index);
    onTabChange?.(index);
  };

  const ActiveComponent = tabs[activeTab].component;

  return (
    <View style={tabStyles.container}>
      {pageTitle && (
        <Text
          style={[
            typography.h1,
            {
              paddingLeft: 22,
              color: colorPallet.primary,
            },
          ]}
        >
          {pageTitle}
        </Text>
      )}

      {/* Floating Tab Bar */}
      <View style={tabStyles.tabBarContainer}>
        <View style={[tabStyles.tabBar, tabBarStyle]}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              style={[
                tabStyles.tab,
                {
                  backgroundColor:
                    activeTab === index ? activeTabColor : inactiveTabColor,
                },
              ]}
              onPress={() => handleTabPress(index)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  tabStyles.tabText,
                  {
                    color:
                      activeTab === index ? activeTextColor : inactiveTextColor,
                  },
                ]}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ActiveComponent />
    </View>
  );
};

export default TabBar;
