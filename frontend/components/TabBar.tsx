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
  outerContainerStyle?: ViewStyle;
  pageTitleStyle?: TextStyle;
  tabBarContainerStyle?: ViewStyle;
  tabBarStyle?: ViewStyle;
  tabButtonStyle?: ViewStyle;
  tabTextStyle?: TextStyle;
  contentContainerStyle?: ViewStyle;
  backgroundColor?: string;
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
  outerContainerStyle,
  pageTitleStyle,
  tabBarContainerStyle,
  tabBarStyle,
  tabButtonStyle,
  tabTextStyle,
  contentContainerStyle,
  backgroundColor,
  activeTabColor = colorPallet.primary,
  inactiveTabColor = "transparent",
  activeTextColor = colorPallet.neutral_darkest,
  inactiveTextColor = colorPallet.neutral_lightest,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const ActiveComponent = tabs[activeTab].component;

  const handleTabPress = (index: number) => {
    if (index !== activeTab) {
      setActiveTab(index);
      onTabChange?.(index);
    }
  };

  return (
    <View
      style={[
        tabStyles.container,
        backgroundColor && { backgroundColor },
        outerContainerStyle,
      ]}
    >
      {pageTitle && (
        <Text
          style={[
            typography.h1,
            { paddingLeft: 22, color: colorPallet.primary },
            pageTitleStyle,
          ]}
        >
          {pageTitle}
        </Text>
      )}

      <View style={[tabStyles.tabBarContainer, tabBarContainerStyle]}>
        <View style={[tabStyles.tabBar, tabBarStyle]}>
          {tabs.map((tab, index) => {
            const isActive = activeTab === index;
            return (
              <TouchableOpacity
                key={tab.name}
                style={[
                  tabStyles.tab,
                  tabButtonStyle,
                  {
                    backgroundColor: isActive
                      ? activeTabColor
                      : inactiveTabColor,
                  },
                ]}
                onPress={() => handleTabPress(index)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    tabStyles.tabText,
                    tabTextStyle,
                    { color: isActive ? activeTextColor : inactiveTextColor },
                  ]}
                >
                  {tab.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={[{ flex: 1 }, contentContainerStyle]}>
        <ActiveComponent />
      </View>
    </View>
  );
};

export default TabBar;
