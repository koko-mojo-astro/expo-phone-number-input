import React, { useState } from 'react';
import { ScrollView, Text, View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { PhoneNumberInput, PhoneNumberInputValue } from 'expo-phone-number-input';

export default function App() {
  const [basicValue, setBasicValue] = useState<PhoneNumberInputValue | null>(null);
  const [darkValue, setDarkValue] = useState<PhoneNumberInputValue | null>(null);
  const [customValue, setCustomValue] = useState<PhoneNumberInputValue | null>(null);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>📱 Phone Number Input</Text>
        <Text style={styles.subtitle}>A customizable phone input for React Native</Text>
        
        {/* Default Light Theme */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Default Style</Text>
          <Text style={styles.sectionDescription}>A clean design that works in any app</Text>
          <PhoneNumberInput
            defaultCountry="NZ"
            placeholder="Enter your phone number"
            modalTitle="Select Country"
            searchPlaceholder="Search countries..."
            onChange={setBasicValue}
            containerStyle={styles.inputSpacing}
          />
          {basicValue && <PhoneDisplay value={basicValue} />}
        </View>

        {/* Dark Theme */}
        <View style={[styles.section, styles.darkSection]}>
          <Text style={[styles.sectionTitle, styles.darkText]}>🌙 Dark Theme</Text>
          <Text style={[styles.sectionDescription, styles.darkText]}>Perfect for dark mode apps</Text>
          <PhoneNumberInput
            defaultCountry="SG"
            placeholder="Phone number"
            colorBackground="#1F2937"
            colorBorder="#374151"
            colorText="#F9FAFB"
            colorPlaceholder="#9CA3AF"
            colorAccent="#60A5FA"
            colorDanger="#F87171"
            modalTitle="Select Country"
            searchPlaceholder="Search countries..."
            searchIcon="🔍"
            onChange={setDarkValue}
            containerStyle={styles.inputSpacing}
          />
          {darkValue && <PhoneDisplay value={darkValue} isDark />}
        </View>

        {/* Custom Branded */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Custom Branded</Text>
          <Text style={[styles.sectionDescription, { marginBottom: 8 }]}>Fully customizable to match your brand</Text>
          <Text style={[styles.sectionDescription, { fontSize: 12, fontStyle: 'italic' }]}>Custom modal title, no search icon</Text>
          <PhoneNumberInput
            defaultCountry="TH"
            placeholder="Placeholder"
            colorBackground="#FEF7FF"
            colorBorder="#E9D5FF"
            colorText="#581C87"
            colorPlaceholder="#A855F7"
            colorAccent="#7C3AED"
            colorDanger="#DC2626"
            modalTitle="🌍 Choose Your Country"
            searchPlaceholder="Type to search..."
            showSearchIcon={false}
            containerStyle={[styles.inputSpacing, styles.customContainer]}
            inputStyle={styles.customInput}
            flagTextStyle={styles.customFlag}
            onChange={setCustomValue}
          />
          {customValue && <PhoneDisplay value={customValue} />}
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Features</Text>
          <View style={styles.featureList}>
            <FeatureItem icon="✓" text="Real-time validation with libphonenumber-js" />
            <FeatureItem icon="✓" text="Beautiful country picker with full country names" />
            <FeatureItem icon="✓" text="Customizable modal title and search options" />
            <FeatureItem icon="✓" text="Full TypeScript support" />
            <FeatureItem icon="✓" text="Highly customizable theming" />
            <FeatureItem icon="✓" text="Accessibility optimized" />
            <FeatureItem icon="✓" text="Works on iOS, Android & Web" />
          </View>
        </View>

        {/* API Usage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Quick Start</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>
{`import { PhoneNumberInput } from 'expo-phone-number-input';

<PhoneNumberInput
  defaultCountry="US"
  placeholder="Phone number"
  modalTitle="Select Country"
  searchPlaceholder="Search countries..."
  searchIcon="🔍"
  onChange={(value) => {
    console.log(value.e164); // +12345678900
    console.log(value.isValid); // true/false
    console.log(value.country); // US
  }}
/>`}
            </Text>
          </View>
        </View>
      </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

interface PhoneDisplayProps {
  value: PhoneNumberInputValue;
  isDark?: boolean;
}

const PhoneDisplay: React.FC<PhoneDisplayProps> = ({ value, isDark }) => (
  <View style={[styles.phoneDisplay, isDark && styles.phoneDisplayDark]}>
    <View style={styles.phoneDisplayRow}>
      <Text style={[styles.phoneDisplayLabel, isDark && styles.darkText]}>Raw:</Text>
      <Text style={[styles.phoneDisplayValue, isDark && styles.darkText]}>{value.raw}</Text>
    </View>
    <View style={styles.phoneDisplayRow}>
      <Text style={[styles.phoneDisplayLabel, isDark && styles.darkText]}>Formatted:</Text>
      <Text style={[styles.phoneDisplayValue, isDark && styles.darkText]}>{value.international}</Text>
    </View>
    <View style={styles.phoneDisplayRow}>
      <Text style={[styles.phoneDisplayLabel, isDark && styles.darkText]}>E164:</Text>
      <Text style={[styles.phoneDisplayValue, isDark && styles.darkText]}>{value.e164 || 'null'}</Text>
    </View>
    <View style={styles.phoneDisplayRow}>
      <Text style={[styles.phoneDisplayLabel, isDark && styles.darkText]}>Valid:</Text>
      <Text style={[
        styles.phoneDisplayValue, 
        { color: value.isValid ? '#10B981' : '#EF4444' },
        isDark && styles.darkText
      ]}>
        {value.isValid ? '✓ Yes' : '✗ No'}
      </Text>
    </View>
  </View>
);

interface FeatureItemProps {
  icon: string;
  text: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 32,
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  darkSection: {
    backgroundColor: '#111827',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    color: '#111827',
    letterSpacing: -0.3,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    fontWeight: '500',
  },
  darkText: {
    color: '#F9FAFB',
  },
  inputSpacing: {
    marginBottom: 16,
  },
  customContainer: {
    borderWidth: 2,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  customInput: {
    fontSize: 18,
    fontWeight: '600',
  },
  customFlag: {
    fontSize: 26,
  },
  phoneDisplay: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  phoneDisplayDark: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
  },
  phoneDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  phoneDisplayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  phoneDisplayValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
    textAlign: 'right',
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '700',
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  codeBlock: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  codeText: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontSize: 13,
    color: '#E5E7EB',
    lineHeight: 20,
  },
});
