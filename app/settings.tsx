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
import { useTheme } from '@/hooks/useTheme';
import { AppHeader } from '@/components/headers/AppHeader';
import { AccessibleButton } from '@/components/buttons/AccessibleButton';
import { TTSService } from '@/services/TTSService';
import { useIconSize } from '@/contexts/IconSizeContext';
import { Settings, Volume2, User, Moon, Bell, Mic, Languages, CircleHelp as HelpCircle, Shield, Trash2, ChevronRight, Type, Key, Eye } from 'lucide-react-native';

export default function SettingsScreen() {
  const { colors, fontSize, fontScale, isDarkMode, toggleTheme, updateFontScale } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const { iconSize, setIconSize } = useIconSize();
  const [pendingIconSize, setPendingIconSize] = useState(iconSize);

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
  };

  const handleSpeechRateComplete = () => {
    speakWithCurrentSettings('Speech speed adjusted');
  };

  const handleSpeechPitchChange = (value: number) => {
    setSpeechPitch(value);
    saveSettings('speechPitch', value);
    TTSService.setSpeechPitch(value);
  };

  const handleSpeechPitchComplete = () => {
    speakWithCurrentSettings('Speech pitch adjusted');
  };

  const handleFontScaleChange = (value: number) => {
    updateFontScale(value);
  };

  const handleFontScaleComplete = () => {
    speakWithCurrentSettings('Text size adjusted');
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
            updateFontScale(1);
            
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

  const renderSettingItem = (
    label: string,
    component: React.ReactNode,
    icon: React.ReactNode
  ) => (
    <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
      <View style={styles.settingLabel}>
        {icon}
        <Text style={[styles.label, { color: colors.text, fontSize: fontSize.medium }]}>{label}</Text>
      </View>
      {component}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Settings" showMenu={false} compact={true} />
      
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
                  fontSize: fontSize.medium
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
                textStyle={{ color: colors.onPrimary, fontSize: fontSize.small }}
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
              <Text style={[styles.profileName, { color: colors.text, fontSize: fontSize.large }]}>
                {profileName || 'Set your name'}
              </Text>
              <Text style={[styles.editText, { color: colors.primary, fontSize: fontSize.small }]}>
                Edit
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Accessibility Settings */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.large }]}>Accessibility</Text>
          
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
          
          {renderSettingItem('Text Size', 
            <View style={styles.sliderContainer}>
              <Slider
                value={fontScale}
                onValueChange={handleFontScaleChange}
                onSlidingComplete={handleFontScaleComplete}
                minimumValue={0.8}
                maximumValue={2.0}
                step={0.1}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
                style={styles.slider}
                accessible={true}
                accessibilityLabel={`Text size: ${fontScale.toFixed(1)} times normal`}
                accessibilityRole="adjustable"
              />
              <Text style={[styles.value, { color: colors.textSecondary, fontSize: fontSize.small }]}>
                {fontScale.toFixed(1)}x
              </Text>
            </View>,
            <AppIcon icon={AppIcons.Type} color={colors.primary} />
          )}
          
          {voiceFeedbackEnabled && (
            <>
              {renderSettingItem('Speech Rate', 
                <View style={styles.sliderContainer}>
                  <Slider
                    value={speechRate}
                    onValueChange={handleSpeechRateChange}
                    onSlidingComplete={handleSpeechRateComplete}
                    minimumValue={0.3}
                    maximumValue={1.0}
                    step={0.05}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.primary}
                    style={styles.slider}
                    accessible={true}
                    accessibilityLabel={`Speech rate: ${speechRate.toFixed(2)} times normal`}
                    accessibilityRole="adjustable"
                  />
                  <Text style={[styles.value, { color: colors.textSecondary, fontSize: fontSize.small }]}>
                    {speechRate.toFixed(1)}x
                  </Text>
                </View>,
                <Text style={[styles.subIcon, { color: colors.primary, fontSize: fontSize.medium }]}>R</Text>
              )}
              
              {renderSettingItem('Speech Pitch', 
                <View style={styles.sliderContainer}>
                  <Slider
                    value={speechPitch}
                    onValueChange={handleSpeechPitchChange}
                    onSlidingComplete={handleSpeechPitchComplete}
                    minimumValue={0.5}
                    maximumValue={2.0}
                    step={0.1}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.primary}
                    style={styles.slider}
                    accessible={true}
                    accessibilityLabel={`Speech pitch: ${speechPitch.toFixed(1)}`}
                    accessibilityRole="adjustable"
                  />
                  <Text style={[styles.value, { color: colors.textSecondary, fontSize: fontSize.small }]}>
                    {speechPitch.toFixed(1)}
                  </Text>
                </View>,
                <Text style={[styles.subIcon, { color: colors.primary, fontSize: fontSize.medium }]}>P</Text>
              )}
              
              {renderSettingItem('Voice Selection', 
                <TouchableOpacity 
                  style={styles.optionButton}
                  onPress={selectVoice}
                  accessible={true}
                  accessibilityLabel={`Current voice: ${speechVoice ? speechVoice.substring(0, 15) + '...' : 'Default'}. Tap to change`}
                  accessibilityRole="button"
                >
                  <Text style={[styles.optionValue, { color: colors.textSecondary, fontSize: fontSize.small }]}>
                    {speechVoice ? speechVoice.substring(0, 15) + '...' : 'Default'}
                  </Text>
                  <ChevronRight size={18} color={colors.textSecondary} />
                </TouchableOpacity>,
                <AppIcon icon={AppIcons.Mic} color={colors.primary} />
              )}
            </>
          )}

          {/* Icon Size Accessibility Control */}
          <View style={{ marginTop: 24, alignItems: 'center', paddingHorizontal: 8 }}>
            <Text style={{ fontSize: fontSize.medium, fontWeight: 'bold', marginBottom: 8, color: colors.text }}>Icon Size</Text>
            <AppIcon icon={Settings} color={colors.primary} size={pendingIconSize} />
            <Slider
              minimumValue={16}
              maximumValue={64}
              value={pendingIconSize}
              onValueChange={setPendingIconSize}
              step={1}
              style={{ width: '100%', marginVertical: 12 }}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <Text style={{ color: colors.textSecondary }}>{pendingIconSize}px</Text>
            <AccessibleButton
              title="Apply"
              onPress={() => setIconSize(pendingIconSize)}
              style={{ marginTop: 12, backgroundColor: colors.primary, width: 120 }}
              textStyle={{ color: colors.onPrimary, fontSize: fontSize.medium, textAlign: 'center' }}
              accessibilityLabel="Apply icon size"
            />
          </View>
        </View>

        {/* OCR Configuration */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.large }]}>OCR Configuration</Text>
          
          {renderSettingItem('API Key', 
            isEditingApiKey ? (
              <View style={styles.editApiKeyContainer}>
                <TextInput
                  style={[styles.apiKeyInput, { 
                    color: colors.text, 
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    fontSize: fontSize.small
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
                  textStyle={{ color: colors.onPrimary, fontSize: fontSize.small }}
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
                <Text style={[styles.optionValue, { color: colors.textSecondary, fontSize: fontSize.small }]}>
                  {ocrApiKey ? '••••••••' : 'Not set'}
                </Text>
                <ChevronRight size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ),
            <AppIcon icon={AppIcons.Key} color={colors.primary} />
          )}
          
          <View style={[styles.apiKeyInfo, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Eye size={16} color={colors.textSecondary} />
            <Text style={[styles.apiKeyInfoText, { color: colors.textSecondary, fontSize: fontSize.small }]}>
              {/* TODO: Add your OCR API key here. You can get one from OCR.space or similar services */}
              Configure your OCR API key for text extraction from images. Get your key from OCR.space or similar services.
            </Text>
          </View>
        </View>

        {/* Appearance Settings */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.large }]}>Appearance</Text>
          
          {renderSettingItem('Dark Mode', 
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={isDarkMode ? colors.primary : colors.textSecondary}
              accessible={true}
              accessibilityLabel={`Dark mode ${isDarkMode ? 'enabled' : 'disabled'}`}
              accessibilityRole="switch"
            />,
            <AppIcon icon={AppIcons.Moon} color={colors.primary} />
          )}
          
          {renderSettingItem('Language', 
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={selectLanguage}
              accessible={true}
              accessibilityLabel={`Current language: ${language}. Tap to change`}
              accessibilityRole="button"
            >
              <Text style={[styles.optionValue, { color: colors.textSecondary, fontSize: fontSize.small }]}>
                {language}
              </Text>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>,
            <AppIcon icon={AppIcons.Languages} color={colors.primary} />
          )}
        </View>

        {/* Notifications Settings */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.large }]}>Notifications</Text>
          
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
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.large }]}>Support</Text>
          
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
          <Text style={[styles.sectionTitle, { color: colors.error, fontSize: fontSize.large }]}>Reset</Text>
          
          {renderSettingItem('Reset All Settings', 
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={resetSettings}
              accessible={true}
              accessibilityLabel="Reset all settings to default values"
              accessibilityRole="button"
            >
              <Text style={[styles.resetText, { color: colors.error, fontSize: fontSize.small }]}>Reset</Text>
            </TouchableOpacity>,
            <AppIcon icon={AppIcons.Trash2} color={colors.error} />
          )}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: colors.textSecondary, fontSize: fontSize.small }]}>
            Version 1.0.0
          </Text>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
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
  section: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontWeight: '600',
    padding: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    minHeight: 60,
  },
  settingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  label: {
    fontWeight: '500',
    flex: 1,
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
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  optionValue: {
    marginRight: 8,
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
});