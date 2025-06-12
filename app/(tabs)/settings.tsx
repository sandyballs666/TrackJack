import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Bell, Shield, CircleHelp as HelpCircle, Info, ChevronRight, Bluetooth, MapPin, Volume2, Vibrate } from 'lucide-react-native';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  type: 'navigation' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const settingSections = [
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Profile Settings',
          subtitle: 'Edit your personal information',
          icon: User,
          type: 'navigation' as const,
          onPress: () => Alert.alert('Profile', 'Profile settings coming soon!'),
        },
      ],
    },
    {
      title: 'Ball Tracking',
      items: [
        {
          id: 'bluetooth',
          title: 'Bluetooth',
          subtitle: 'Connect to golf ball trackers',
          icon: Bluetooth,
          type: 'toggle' as const,
          value: bluetoothEnabled,
          onToggle: setBluetoothEnabled,
        },
        {
          id: 'location',
          title: 'Location Services',
          subtitle: 'GPS tracking for ball positioning',
          icon: MapPin,
          type: 'toggle' as const,
          value: locationEnabled,
          onToggle: setLocationEnabled,
        },
      ],
    },
    {
      title: 'Notifications & Feedback',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Game updates and reminders',
          icon: Bell,
          type: 'toggle' as const,
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          id: 'sound',
          title: 'Sound Effects',
          subtitle: 'Audio feedback for actions',
          icon: Volume2,
          type: 'toggle' as const,
          value: soundEnabled,
          onToggle: setSoundEnabled,
        },
        {
          id: 'vibration',
          title: 'Vibration',
          subtitle: 'Haptic feedback',
          icon: Vibrate,
          type: 'toggle' as const,
          value: vibrationEnabled,
          onToggle: setVibrationEnabled,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          title: 'Help & FAQ',
          subtitle: 'Get help with JackTrack',
          icon: HelpCircle,
          type: 'navigation' as const,
          onPress: () => Alert.alert('Help', 'Help section coming soon!'),
        },
        {
          id: 'privacy',
          title: 'Privacy Policy',
          subtitle: 'How we protect your data',
          icon: Shield,
          type: 'navigation' as const,
          onPress: () => Alert.alert('Privacy', 'Privacy policy coming soon!'),
        },
        {
          id: 'about',
          title: 'About JackTrack',
          subtitle: 'Version 1.0.0',
          icon: Info,
          type: 'navigation' as const,
          onPress: () => Alert.alert('About', 'JackTrack - Golf Ball Tracking App\nVersion 1.0.0\nMade with ❤️ for golfers'),
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    const IconComponent = item.icon;
    
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={item.onPress}
        disabled={item.type === 'toggle'}
      >
        <View style={styles.settingItemLeft}>
          <View style={styles.settingIconContainer}>
            <IconComponent size={22} color="#6b7280" />
          </View>
          
          <View style={styles.settingItemContent}>
            <Text style={styles.settingItemTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.settingItemSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>

        <View style={styles.settingItemRight}>
          {item.type === 'toggle' ? (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: '#d1d5db', true: '#bbf7d0' }}
              thumbColor={item.value ? '#22C55E' : '#f9fafb'}
            />
          ) : (
            <ChevronRight size={20} color="#d1d5db" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6B7280', '#4B5563']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>
          Customize your JackTrack experience
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settingSections.map((section, index) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            
            <View style={styles.sectionContent}>
              {section.items.map((item) => renderSettingItem(item))}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>
            JackTrack helps golfers track their golf balls with precision GPS and Bluetooth technology.
          </Text>
          <Text style={styles.appInfoSubtext}>
            Never lose a golf ball again!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingItemContent: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  settingItemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
    lineHeight: 18,
  },
  settingItemRight: {
    marginLeft: 16,
  },
  appInfo: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  appInfoText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  appInfoSubtext: {
    fontSize: 14,
    color: '#22C55E',
    fontWeight: '600',
    textAlign: 'center',
  },
});