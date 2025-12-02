/**
 * Tab Bar Component
 * 
 * Segmented control navigation component with customizable styling. Manages
 * tab state, renders active tab content, and provides callbacks for tab changes.
 * Supports optional page title and extensive style customization for all elements.
 */

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

// ============================================================================
// Types
// ============================================================================

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

// ============================================================================
// Component
// ============================================================================

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

  const ActiveComponent = tabs[activeTab]?.component;

  /**
   * Handle tab selection and trigger callback
   */
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
      {/* Optional page title */}
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

      {/* Tab navigation bar */}
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

      {/* Active tab content */}
      <View style={[{ flex: 1 }, contentContainerStyle]}>
        {ActiveComponent && <ActiveComponent />}
      </View>
    </View>
  );
};

export default TabBar;