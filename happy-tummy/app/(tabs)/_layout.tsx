import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Colors, FontFamily } from '@/constants/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

function TabIcon({ IconComponent, iconName, label, focused }: { 
  IconComponent: any; 
  iconName: string; 
  label: string; 
  focused: boolean;
}) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <IconComponent 
        name={iconName} 
        size={26} 
        color={focused ? Colors.red : Colors.gray500} 
      />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarItemStyle: styles.tabBarItem,
        tabBarIconStyle: styles.tabBarIcon,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              IconComponent={Ionicons}
              iconName="home" 
              label="Home" 
              focused={focused} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              IconComponent={MaterialCommunityIcons}
              iconName="clipboard-text" 
              label="Daily Log" 
              focused={focused} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              IconComponent={Ionicons}
              iconName="chatbubble-ellipses" 
              label="AI Chat" 
              focused={focused} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              IconComponent={Ionicons}
              iconName="person-circle" 
              label="Profile" 
              focused={focused} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="baby/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="child-profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 76,
    backgroundColor: Colors.white,
    borderTopWidth: 3,
    borderTopColor: Colors.outline,
    paddingTop: 8,
    paddingBottom: 8,
    overflow: 'visible',
  },
  tabBarItem: {
    flex: 1,
    marginHorizontal: 0,
    borderRadius: 14,
    paddingHorizontal: 0,
  },
  tabBarIcon: {
    marginTop: 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingVertical: 8,
    borderRadius: 14,
    minWidth: 0,
    width: '100%',
  },
  tabItemActive: {
    backgroundColor: Colors.redPale,
  },
});