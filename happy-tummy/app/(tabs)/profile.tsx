import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Colors, FontFamily, Shadow, Radius } from '@/constants/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

  const ProfileOption = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true,
    rightComponent 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity style={styles.optionItem} onPress={onPress}>
      <View style={styles.optionLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={20} color={Colors.red} />
        </View>
        <View style={styles.optionText}>
          <Text style={styles.optionTitle}>{title}</Text>
          {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.optionRight}>
        {rightComponent}
        {showArrow && !rightComponent && (
          <Ionicons name="chevron-forward" size={16} color={Colors.gray500} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile & Settings</Text>
        </View>

        {/* User Profile Section */}
        <View style={styles.section}>
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Ionicons name="person" size={32} color={Colors.white} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>John Doe</Text>
              <Text style={styles.profileEmail}>john.doe@example.com</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil" size={16} color={Colors.red} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.optionsContainer}>
            <ProfileOption
              icon="person-outline"
              title="Personal Information"
              subtitle="Name, email, phone number"
              onPress={() => console.log('Personal Info')}
            />
            <ProfileOption
              icon="lock-closed-outline"
              title="Privacy & Security"
              subtitle="Password, two-factor authentication"
              onPress={() => console.log('Privacy')}
            />
            <ProfileOption
              icon="card-outline"
              title="Payment Methods"
              subtitle="Manage your payment options"
              onPress={() => console.log('Payment')}
            />
          </View>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.optionsContainer}>
            <ProfileOption
              icon="notifications-outline"
              title="Push Notifications"
              subtitle="Get notified about meal reminders"
              showArrow={false}
              rightComponent={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: Colors.gray300, true: Colors.redPale }}
                  thumbColor={notificationsEnabled ? Colors.red : Colors.gray500}
                />
              }
            />
            <ProfileOption
              icon="moon-outline"
              title="Dark Mode"
              subtitle="Switch to dark theme"
              showArrow={false}
              rightComponent={
                <Switch
                  value={darkModeEnabled}
                  onValueChange={setDarkModeEnabled}
                  trackColor={{ false: Colors.gray300, true: Colors.redPale }}
                  thumbColor={darkModeEnabled ? Colors.red : Colors.gray500}
                />
              }
            />
            <ProfileOption
              icon="language-outline"
              title="Language"
              subtitle="English"
              onPress={() => console.log('Language')}
            />
          </View>
        </View>

        {/* Health & Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health & Data</Text>
          <View style={styles.optionsContainer}>
            <ProfileOption
              icon="fitness-outline"
              title="Health Goals"
              subtitle="Set your dietary preferences"
              onPress={() => console.log('Health Goals')}
            />
            <ProfileOption
              icon="analytics-outline"
              title="Data Export"
              subtitle="Download your food logs"
              onPress={() => console.log('Data Export')}
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.optionsContainer}>
            <ProfileOption
              icon="help-circle-outline"
              title="Help Center"
              subtitle="FAQs and support articles"
              onPress={() => console.log('Help')}
            />
            <ProfileOption
              icon="chatbubble-outline"
              title="Contact Us"
              subtitle="Get in touch with our team"
              onPress={() => console.log('Contact')}
            />
            <ProfileOption
              icon="document-text-outline"
              title="Terms & Privacy"
              subtitle="Legal information"
              onPress={() => console.log('Terms')}
            />
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Happy Tummy v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.redPale,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontFamily: FontFamily.displayBold,
    fontSize: 28,
    color: Colors.red,
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 16,
    color: Colors.red,
    marginBottom: 12,
    marginHorizontal: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: Radius.md,
    ...Shadow.md,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 18,
    color: Colors.red,
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: Colors.gray500,
  },
  editButton: {
    padding: 8,
  },
  optionsContainer: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: Radius.md,
    ...Shadow.sm,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomColor: Colors.outline,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.redPale,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 16,
    color: Colors.red,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    color: Colors.gray500,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signOutButton: {
    backgroundColor: Colors.red,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: Radius.md,
    alignItems: 'center',
    ...Shadow.sm,
  },
  signOutText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 16,
    color: Colors.white,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  versionText: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    color: Colors.gray500,
  },
});