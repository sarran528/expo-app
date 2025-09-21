import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import { AppIcon, AppIcons } from '@/components/AppIcon';
import { useTheme } from '@/contexts/ThemeContext';
import { AppHeader } from '@/components/headers/AppHeader';
import { AccessibleButton } from '@/components/buttons/AccessibleButton';
import { TTSService } from '@/services/TTSService';
import { useIconSize } from '@/contexts/IconSizeContext';
import { Settings, Volume2, User, Moon, Bell, Mic, Languages, CircleHelp as HelpCircle, Shield, Trash2, ChevronRight, Type, Key, Eye } from 'lucide-react-native';
import { useRouter } from 'expo-router';

type Colors = {
  background: string;
  border: string;
  surface: string;
  text: string;
  primary: string;
  textSecondary: string;
};

const createStyles = (colors: Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  sampleIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    height: 60,
  },
  sampleTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    height: 40,
  },
  section: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontWeight: '600',
    padding: 16,
    paddingBottom: 8,
    color: colors.text,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 60,
  },
  settingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontWeight: '500',
    flex: 1,
    color: colors.text,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  optionValue: {
    marginRight: 8,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    paddingVertical: 4,
  },
  changeButton: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  changeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  sizeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  sizeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  profileSection: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  profileCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    fontWeight: '600',
    marginRight: 8,
  },
  editText: {
    fontWeight: '500',
  },
  editNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 8,
  },
  nameInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontWeight: '500',
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  icon: {
    marginRight: 12,
  },
  subIcon: {
    marginRight: 12,
    fontWeight: 'bold',
    width: 24,
    textAlign: 'center',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    marginLeft: 16,
    minWidth: 120,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  value: {
    width: 40,
    textAlign: 'right',
    fontWeight: '500',
  },
  editApiKeyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  apiKeyInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    fontWeight: '500',
    minHeight: 40,
  },
  saveApiKeyButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minHeight: 40,
  },
  apiKeyInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  apiKeyInfoText: {
    flex: 1,
    lineHeight: 20,
  },
  resetText: {
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  versionText: {
    fontWeight: '500',
  },
  textSizeControlContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  textSizePresets: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

const SettingsScreenComponent = () => {
  const { colors, fontSize, textSize, setTextSize, theme, setTheme } = useTheme();
  const styles = createStyles(colors);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const { iconSize, setIconSize } = useIconSize();
  const [pendingTextSize, setPendingTextSize] = useState(textSize);
  const [pendingIconSize, setPendingIconSize] = useState(iconSize);
  const router = useRouter();

  // Settings state
  const [speechRate, setSpeechRate] = useState(0.75);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profileName, setProfileName] = useState('');
  const [language, setLanguage] = useState('English');
  const [speechVoice, setSpeechVoice] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<Speech.Voice[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [ocrApiKey, setOcrApiKey] = useState('');
  const [isEditingApiKey, setIsEditingApiKey] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    loadSettings();
    fetchAvailableVoices();
    
    if (voiceFeedbackEnabled) {
      speakWithCurrentSettings('Settings page loaded');
    }
  }, []);

  const fetchAvailableVoices = async () => {
    try {
      const voices = await TTSService.getAvailableVoices();
      setAvailableVoices(voices);
    } catch (error) {
      console.error('Error fetching voices:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const settingsData = await AsyncStorage.multiGet([
        'voiceEnabled',
        'speechRate',
        'speechPitch',
        'profileName',
        'language',
        'notifications',
        'speechVoice',
        'ocrApiKey'
      ]);

      const settings = Object.fromEntries(settingsData);
      
      if (settings.voiceEnabled !== null) setVoiceFeedbackEnabled(settings.voiceEnabled === 'true');
      if (settings.speechRate !== null) setSpeechRate(Number(settings.speechRate));
      if (settings.speechPitch !== null) setSpeechPitch(Number(settings.speechPitch));
      if (settings.profileName !== null) setProfileName(settings.profileName);
      if (settings.language !== null) setLanguage(settings.language);
      if (settings.notifications !== null) setNotificationsEnabled(settings.notifications === 'true');
      if (settings.speechVoice !== null) setSpeechVoice(settings.speechVoice);
      if (settings.ocrApiKey !== null) setOcrApiKey(settings.ocrApiKey);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (key: string, value: string | number | boolean | null) => {
    try {
      await AsyncStorage.setItem(key, value !== null ? value.toString() : '');
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  const speakWithCurrentSettings = (text: string) => {
    if (voiceFeedbackEnabled) {
      TTSService.setSpeechRate(speechRate);
      TTSService.setSpeechPitch(speechPitch);
      TTSService.speak(text);
    }
  };

  const toggleVoiceFeedback = (value: boolean) => {
    setVoiceFeedbackEnabled(value);
    saveSettings('voiceEnabled', value);
    if (value) {
      TTSService.speak('Voice assistance enabled', { rate: speechRate, pitch: speechPitch });
    }
  };

  const toggleNotifications = (value: boolean) => {
    setNotificationsEnabled(value);
    saveSettings('notifications', value);
    speakWithCurrentSettings('Notifications setting changed');
  };

  const handleSpeechRateChange = (value: number) => {
    setSpeechRate(value);
    saveSettings('speechRate', value);
    TTSService.setSpeechRate(value);
    TTSService.speak('Testing new speech speed', { rate: value });
  };

  const handleSpeechPitchChange = (value: number) => {
    setSpeechPitch(value);
    saveSettings('speechPitch', value);
    TTSService.setSpeechPitch(value);
    TTSService.speak('Testing new speech pitch', { pitch: value });
  };

  const handleProfileNameChange = (value: string) => {
    setProfileName(value);
    saveSettings('profileName', value);
  };

  const handleProfileNameSubmit = () => {
    setIsEditing(false);
    if (profileName.trim() !== '') {
      speakWithCurrentSettings(`Profile name set to ${profileName}`);
    }
  };

  const handleOcrApiKeyChange = (value: string) => {
    setOcrApiKey(value);
    saveSettings('ocrApiKey', value);
  };

  const handleOcrApiKeySubmit = () => {
    setIsEditingApiKey(false);
    if (ocrApiKey.trim() !== '') {
      speakWithCurrentSettings('OCR API key updated');
    }
  };

  const selectLanguage = () => {
    Alert.alert(
      'Select Language',
      'Choose your preferred language',
      [
        { text: 'English', onPress: () => changeLanguage('English') },
        { text: 'Spanish', onPress: () => changeLanguage('Spanish') },
        { text: 'French', onPress: () => changeLanguage('French') },
        { text: 'German', onPress: () => changeLanguage('German') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    saveSettings('language', lang);
    speakWithCurrentSettings(`Language set to ${lang}`);
  };

  const selectVoice = () => {
    if (availableVoices.length === 0) {
      Alert.alert('No voices available', 'No additional voices were found on your device.');
      return;
    }
    
    const commonVoices = availableVoices.slice(0, 5);
    
    const options = commonVoices.map(voice => ({
      text: `${voice.name} (${voice.language})`,
      onPress: () => changeVoice(voice.identifier)
    }));
    
    Alert.alert(
      'Select Voice',
      'Choose your preferred voice',
      [
        ...options,
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const changeVoice = (voiceId: string) => {
    setSpeechVoice(voiceId);
    saveSettings('speechVoice', voiceId);
    speakWithCurrentSettings('Voice changed to this voice');
  };

  const resetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            // Reset all settings
            setSpeechRate(0.75);
            setSpeechPitch(1.0);
            setVoiceFeedbackEnabled(true);
            setNotificationsEnabled(true);
            setProfileName('');
            setLanguage('English');
            setSpeechVoice(null);
            setOcrApiKey('');
            setTextSize(1); // Reset text size to default
            
            // Clear AsyncStorage
            try {
              await AsyncStorage.multiRemove([
                'voiceEnabled',
                'speechRate',
                'speechPitch',
                'profileName',
                'language',
                'notifications',
                'speechVoice',
                'ocrApiKey',
                'fontScale'
              ]);
              
              speakWithCurrentSettings('Settings reset to defaults');
            } catch (error) {
              console.error('Error resetting settings:', error);
            }
          }
        }
      ]
    );
  };

  const Separator = () => (
    <View style={{ height: 1, backgroundColor: colors.textSecondary, borderRadius: 2, marginHorizontal: 16, marginVertical: 8 }} />
  );

  const renderSettingItem = (
    label: string,
    component: React.ReactNode,
    icon: React.ReactNode
  ) => (
    <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
      <View style={styles.settingLabel}>
        {icon && <View style={{ marginRight: 16 }}>{icon}</View>}
        <Text style={[styles.label, { color: colors.text, fontSize: fontSize.medium[textSize] }]}>{label}</Text>
      </View>
      {component}
      <Separator />
    </View>
  );

  // Preset values for icon sizes
  const ICON_SIZES = [
    { label: 'Small', value: 20 },
    { label: 'Medium', value: 28 },
    { label: 'Large', value: 36 },
    { label: 'Extra Large', value: 48 },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, backgroundColor: colors.surface }}>
        <TouchableOpacity
          onPress={() => {
            speakWithCurrentSettings('Going back');
            router.back();
          }}
          style={{ width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <AppIcon icon={AppIcons.ArrowLeft} color={colors.primary} />
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: 'right', fontSize: fontSize.large[textSize], fontWeight: 'bold', color: colors.text, marginRight: 8 }}>
          Settings
        </Text>
      </View>
      
      <Animated.ScrollView 
        contentContainerStyle={styles.content}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        accessible={true}
        accessibilityLabel="Settings content"
      >
        {/* Profile Section */}
        <View style={[styles.profileSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.profileCircle, { backgroundColor: colors.background }]}>
            <AppIcon icon={AppIcons.User} color={colors.primary} />
          </View>
          
          {isEditing ? (
            <View style={styles.editNameContainer}>
              <TextInput
                style={[styles.nameInput, { 
                  color: colors.text, 
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  fontSize: fontSize.medium[textSize]
                }]}
                placeholder="Enter your name"
                placeholderTextColor={colors.textSecondary}
                value={profileName}
                onChangeText={handleProfileNameChange}
                onSubmitEditing={handleProfileNameSubmit}
                autoFocus
                accessible={true}
                accessibilityLabel="Profile name input"
              />
              <AccessibleButton
                title="Save"
                onPress={handleProfileNameSubmit}
                style={[styles.saveButton, { backgroundColor: colors.primary }]as any}
                textStyle={{ color: colors.onPrimary, fontSize: fontSize.small[textSize] }}
                accessibilityLabel="Save profile name"
              />
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.profileNameContainer}
              onPress={() => setIsEditing(true)}
              accessible={true}
              accessibilityLabel={`Profile name: ${profileName || 'Not set'}. Tap to edit`}
              accessibilityRole="button"
            >
              <Text style={[styles.profileName, { color: colors.text, fontSize: fontSize.large[textSize] }]}>
                {profileName || 'Set your name'}
              </Text>
              <Text style={[styles.editText, { color: colors.primary, fontSize: fontSize.small[textSize] }]}>
                Edit
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Accessibility Settings */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border, paddingBottom:30 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.large[textSize] }]}>Accessibility</Text>
          <Separator />
          {renderSettingItem('Voice Feedback', 
            <Switch
              value={voiceFeedbackEnabled}
              onValueChange={toggleVoiceFeedback}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={voiceFeedbackEnabled ? colors.primary : colors.textSecondary}
              accessible={true}
              accessibilityLabel={`Voice feedback ${voiceFeedbackEnabled ? 'enabled' : 'disabled'}`}
              accessibilityRole="switch"
            />,
            <AppIcon icon={AppIcons.Volume2} color={colors.primary} />
          )}
          
          {voiceFeedbackEnabled && (
            <>
            <Separator />
              {renderSettingItem('Speed',
                <View style={styles.valueContainer}>
                  <Text style={[styles.optionValue, { color: colors.textSecondary, fontSize: fontSize.small[textSize] }]}>
                    {speechRate === 0.5 ? 'Very Slow' :
                     speechRate === 0.75 ? 'Slow' :
                     speechRate === 1.0 ? 'Normal' :
                     speechRate === 1.25 ? 'Fast' :
                     'Very Fast'}
                  </Text>
                  <TouchableOpacity 
                    style={styles.optionButton}
                    onPress={() => {
                      Alert.alert(
                        'Select Speech Speed',
                        'Choose a speed for text-to-speech',
                        [
                          { text: 'Very Slow', onPress: () => handleSpeechRateChange(0.5) },
                          { text: 'Slow', onPress: () => handleSpeechRateChange(0.75) },
                          { text: 'Normal', onPress: () => handleSpeechRateChange(1.0) },
                          { text: 'Fast', onPress: () => handleSpeechRateChange(1.25) },
                          { text: 'Very Fast', onPress: () => handleSpeechRateChange(1.5) },
                          { text: 'Cancel', style: 'cancel' }
                        ]
                      );
                    }}
                    accessibilityLabel={`Speech speed: ${speechRate}x. Tap to change`}
                    accessibilityRole="button"
                  >
                    <View style={{
                      backgroundColor: `${colors.primary}15`,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      marginLeft: 8
                    }}>
                      <Text style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: colors.text
                      }}>Change</Text>
                    </View>
                  </TouchableOpacity>
                </View>,
                <AppIcon icon={AppIcons.Zap} color={colors.primary} />
              )}
              
              <Separator />
              
              {renderSettingItem('Pitch',
                <View style={styles.valueContainer}>
                  <Text style={[styles.optionValue, { color: colors.textSecondary, fontSize: fontSize.small[textSize] }]}>
                    {speechPitch === 0.8 ? 'Very Low' :
                     speechPitch === 1.0 ? 'Low' :
                     speechPitch === 1.2 ? 'Normal' :
                     'High'}
                  </Text>
                  <TouchableOpacity 
                    style={styles.optionButton}
                    onPress={() => {
                      Alert.alert(
                        'Select Speech Pitch',
                        'Choose a pitch for text-to-speech',
                        [
                          { text: 'Very Low', onPress: () => handleSpeechPitchChange(0.8) },
                          { text: 'Low', onPress: () => handleSpeechPitchChange(1.0) },
                          { text: 'Normal', onPress: () => handleSpeechPitchChange(1.2) },
                          { text: 'High', onPress: () => handleSpeechPitchChange(1.4) },
                          { text: 'Cancel', style: 'cancel' }
                        ]
                      );
                    }}
                    accessibilityLabel={`Speech pitch: ${speechPitch}x. Tap to change`}
                    accessibilityRole="button"
                  >
                    <View style={{
                      backgroundColor: `${colors.primary}15`,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      marginLeft: 8
                    }}>
                      <Text style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: colors.text
                      }}>Change</Text>
                    </View>
                  </TouchableOpacity>
                </View>,
                <AppIcon icon={AppIcons.Ear} color={colors.primary} />
              )}
              
              <Separator />
              {renderSettingItem('Voice Selection', 
                <TouchableOpacity 
                  style={styles.optionButton}
                  onPress={selectVoice}
                  accessible={true}
                  accessibilityLabel={`Current voice: ${speechVoice ? speechVoice.substring(0, 15) + '...' : 'Default'}. Tap to change`}
                  accessibilityRole="button"
                >
                  <Text style={[styles.optionValue, { color: colors.textSecondary, fontSize: fontSize.small[textSize] }]}>
                    {speechVoice ? speechVoice.substring(0, 15) + '...' : 'Default'}
                  </Text>
                  <View style={{
                    backgroundColor: `${colors.primary}15`,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    marginLeft: 8
                  }}>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: colors.text
                    }}>Change</Text>
                  </View>
                </TouchableOpacity>,
                <AppIcon icon={AppIcons.Mic} color={colors.primary} />
              )}
            </>
          )}
            <Separator />
           {/* Text Size Control (above Icon Size) */}
           <View style={{ marginTop: 24, alignItems: 'center', paddingHorizontal: 8, width: '100%' }}>
            <Text style={{ fontSize: fontSize.medium[textSize], fontWeight: 'bold', marginBottom: 8, color: colors.text }}>
              Text Size
            </Text>
            
            {/* Sample Text */}
            <View style={styles.sampleTextContainer}>
              <Text style={{ fontSize: fontSize.medium[pendingTextSize], fontWeight: '500', color: colors.primary }}>
                Sample Text
              </Text>
            </View>

            {/* Size Buttons */}
            <View style={styles.sizeButtonsContainer}>
              <TouchableOpacity
                onPress={() => setPendingTextSize(0)}
                style={[
                  styles.sizeButton,
                  { backgroundColor: pendingTextSize === 0 ? colors.primary + '20' : 'transparent' }
                ]}
                accessibilityLabel="Set text size to small"
                accessibilityRole="button"
              >
                <Text style={{
                  color: pendingTextSize === 0 ? colors.primary : colors.textSecondary,
                  fontWeight: pendingTextSize === 0 ? 'bold' : 'normal',
                  fontSize: fontSize.small[textSize]
                }}>
                  Small
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPendingTextSize(1)}
                style={[
                  styles.sizeButton,
                  { backgroundColor: pendingTextSize === 1 ? colors.primary + '20' : 'transparent' }
                ]}
                accessibilityLabel="Set text size to medium"
                accessibilityRole="button"
              >
                <Text style={{
                  color: pendingTextSize === 1 ? colors.primary : colors.textSecondary,
                  fontWeight: pendingTextSize === 1 ? 'bold' : 'normal',
                  fontSize: fontSize.small[textSize]
                }}>
                  Medium
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPendingTextSize(2)}
                style={[
                  styles.sizeButton,
                  { backgroundColor: pendingTextSize === 2 ? colors.primary + '20' : 'transparent' }
                ]}
                accessibilityLabel="Set text size to large"
                accessibilityRole="button"
              >
                <Text style={{
                  color: pendingTextSize === 2 ? colors.primary : colors.textSecondary,
                  fontWeight: pendingTextSize === 2 ? 'bold' : 'normal',
                  fontSize: fontSize.small[textSize]
                }}>
                  Large
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <Separator />
          {/* Icon Size Accessibility Control */}
          <View style={{ marginTop: 24, alignItems: 'center', paddingHorizontal: 8, width: '100%' }}>
            <Text style={{ fontSize: fontSize.medium[textSize], fontWeight: 'bold', marginBottom: 8, color: colors.text }}>
              Icon Size
            </Text>

            {/* Sample Icon */}
            <View style={styles.sampleIconContainer}>
              <AppIcon 
                icon={AppIcons.Settings} 
                color={colors.primary} 
                size={pendingIconSize} 
              />
            </View>

            {/* Size Buttons */}
            <View style={styles.sizeButtonsContainer}>
              {ICON_SIZES.map(({ label, value }) => (
                <TouchableOpacity
                  key={label}
                  onPress={() => setPendingIconSize(value)}
                  style={[
                    styles.sizeButton,
                    { backgroundColor: pendingIconSize === value ? colors.primary + '20' : 'transparent' }
                  ]}
                  accessibilityLabel={`Set icon size to ${label}`}
                  accessibilityRole="button"
                >
                  <Text style={{
                    color: pendingIconSize === value ? colors.primary : colors.textSecondary,
                    fontWeight: pendingIconSize === value ? 'bold' : 'normal',
                    fontSize: fontSize.small[textSize]
                  }}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

          </View>

          {/* Apply All Accessibility Settings Button */}
          <View style={{ marginTop: 24, alignItems: 'center', paddingHorizontal: 76 }}>
            <AccessibleButton
              title="Apply"
              onPress={() => {
                setTextSize(pendingTextSize);
                setIconSize(pendingIconSize);
                saveSettings('speechRate', speechRate);
                saveSettings('speechPitch', speechPitch);
                TTSService.setSpeechRate(speechRate);
                TTSService.setSpeechPitch(speechPitch);
                speakWithCurrentSettings('Accessibility settings applied');
              }}
              style={{ backgroundColor: colors.primary, width: '100%' }}
              textStyle={{ color: colors.onPrimary, fontSize: fontSize.medium[textSize], textAlign: 'center' }}
              accessibilityLabel="Apply all accessibility settings"
            />
          </View>
        </View>

        {/* OCR Configuration */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.large[textSize] }]}>OCR Configuration</Text>
          <Separator />
          {renderSettingItem('API Key', 
            isEditingApiKey ? (
              <View style={styles.editApiKeyContainer}>
                <TextInput
                  style={[styles.apiKeyInput, { 
                    color: colors.text, 
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    fontSize: fontSize.small[textSize]
                  }]}
                  placeholder="Enter OCR API key"
                  placeholderTextColor={colors.textSecondary}
                  value={ocrApiKey}
                  onChangeText={handleOcrApiKeyChange}
                  onSubmitEditing={handleOcrApiKeySubmit}
                  secureTextEntry={true}
                  autoFocus
                  accessible={true}
                  accessibilityLabel="OCR API key input"
                />
                <AccessibleButton
                  title="Save"
                  onPress={handleOcrApiKeySubmit}
                  style={[styles.saveApiKeyButton, { backgroundColor: colors.primary }]as any}
                  textStyle={{ color: colors.onPrimary, fontSize: fontSize.small[textSize] }}
                  accessibilityLabel="Save OCR API key"
                />
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.optionButton}
                onPress={() => setIsEditingApiKey(true)}
                accessible={true}
                accessibilityLabel={`OCR API key ${ocrApiKey ? 'configured' : 'not set'}. Tap to edit`}
                accessibilityRole="button"
              >
                <Text style={[styles.optionValue, { color: colors.textSecondary, fontSize: fontSize.small[textSize] }]}>
                  {ocrApiKey ? '••••••••' : 'Not set'}
                </Text>
                <ChevronRight size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ),
            <AppIcon icon={AppIcons.Key} color={colors.primary} />
          )}
          
          <Separator />

          <View style={[styles.apiKeyInfo, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Eye size={16} color={colors.textSecondary} />
            <Text style={[styles.apiKeyInfoText, { color: colors.textSecondary, fontSize: fontSize.small[textSize] }]}>
              {/* TODO: Add your OCR API key here. You can get one from OCR.space or similar services */}
              Configure your OCR API key for text extraction from images. Get your key from OCR.space or similar services.
            </Text>
          </View>
        </View>

        {/* Appearance Settings */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.large[textSize] }]}>Appearance</Text>
          
          {/* Dark Mode Switch - REMOVED as per edit hint */}
          <Separator />
          {renderSettingItem('Language', 
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={selectLanguage}
              accessible={true}
              accessibilityLabel={`Current language: ${language}. Tap to change`}
              accessibilityRole="button"
            >
              <Text style={[styles.optionValue, { color: colors.textSecondary, fontSize: fontSize.small[textSize] }]}>
                {language}
              </Text>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>,
            <AppIcon icon={AppIcons.Languages} color={colors.primary} />
          )}
        </View>

        {/* Theme Settings */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.large[textSize] }]}>Theme</Text>
          <Separator />
          {renderSettingItem('Theme',
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.small[textSize] }}>
                {theme === 'dark' ? 'Theme: Dark' : 'Theme: Light'}
              </Text>
              <Switch
                value={theme === 'dark'}
                onValueChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={theme === 'dark' ? colors.primary : colors.textSecondary}
                accessible={true}
                accessibilityLabel={`Theme ${theme === 'dark' ? 'dark' : 'light'}. Tap to change`}
                accessibilityRole="switch"
              />
            </View>,
            <AppIcon icon={theme === 'dark' ? AppIcons.Moon : AppIcons.Settings} color={colors.primary} />
          )}
        </View>

        {/* Notifications Settings */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.large[textSize] }]}>Notifications</Text>
          <Separator />
          {renderSettingItem('Enable Notifications', 
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={notificationsEnabled ? colors.primary : colors.textSecondary}
              accessible={true}
              accessibilityLabel={`Notifications ${notificationsEnabled ? 'enabled' : 'disabled'}`}
              accessibilityRole="switch"
            />,
            <AppIcon icon={AppIcons.Bell} color={colors.primary} />
          )}
        </View>

        {/* Other Settings */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.large[textSize] }]}>Support</Text>
          <Separator />
          {renderSettingItem('Privacy Policy', 
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={() => {
                speakWithCurrentSettings('Opening privacy policy');
                // TODO: Navigate to privacy policy screen
              }}
              accessible={true}
              accessibilityLabel="View privacy policy"
              accessibilityRole="button"
            >
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>,
            <AppIcon icon={AppIcons.Shield} color={colors.primary} />
          )}
          <Separator />
          {renderSettingItem('Help & Support', 
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={() => {
                speakWithCurrentSettings('Opening help and support');
                // TODO: Navigate to help screen
              }}
              accessible={true}
              accessibilityLabel="Get help and support"
              accessibilityRole="button"
            >
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>,
            <AppIcon icon={AppIcons.CircleHelp} color={colors.primary} />
          )}
        </View>

        {/* Danger Zone */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.error }]}>
          <Text style={[styles.sectionTitle, { color: colors.error, fontSize: fontSize.large[textSize] }]}>Reset</Text>
          
          {renderSettingItem('Reset All Settings', 
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={resetSettings}
              accessible={true}
              accessibilityLabel="Reset all settings to default values"
              accessibilityRole="button"
            >
              <Text style={[styles.resetText, { color: colors.error, fontSize: fontSize.small[textSize] }]}>Reset</Text>
            </TouchableOpacity>,
            <AppIcon icon={AppIcons.Trash2} color={colors.error} />
          )}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: colors.textSecondary, fontSize: fontSize.small[textSize] }]}>
            Version 1.0.0
          </Text>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};  

export default SettingsScreenComponent;