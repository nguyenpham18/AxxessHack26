import { Tabs } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';
import { Colors, FontFamily } from '@/constants/theme';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

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
        size={24} 
        color={focused ? Colors.red : Colors.gray500} 
      />
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
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
              label="Ask AI" 
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
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 72,
    backgroundColor: Colors.white,
    borderTopWidth: 3,
    borderTopColor: Colors.outline,
    paddingTop: 4,
    paddingBottom: 8,
  },
  tabItem: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    minWidth: 60,
  },
  tabItemActive: {
    backgroundColor: Colors.redPale,
  },
  tabLabel: {
    fontFamily: FontFamily.bodyBlack,
    fontSize: 9,
    color: Colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  tabLabelActive: { 
    color: Colors.red 
  },
});