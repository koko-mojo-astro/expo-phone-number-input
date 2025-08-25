import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, TextInput, Text, Pressable, Modal, FlatList, StyleSheet, Platform, ColorValue } from 'react-native';
import type { ListRenderItem } from 'react-native';
import { AsYouType, parsePhoneNumberFromString, CountryCode as LibCountryCode } from 'libphonenumber-js';
import type { PhoneNumberInputProps, PhoneNumberInputValue, CountryCode } from './ExpoPhoneNumberInput.types';
import { getAllCountries, Country } from './countries';
import { clampDigits, isoToEmojiFlag } from './utils';

const DEFAULT_PLACEHOLDER = 'Phone number';

export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value,
  defaultCountry = 'US',
  disabled,
  placeholder = DEFAULT_PLACEHOLDER,
  onChange,
  containerStyle,
  inputStyle,
  countryButtonStyle,
  flagTextStyle,
  colorBackground = '#FFFFFF',
  colorBorder = '#E5E7EB',
  colorText = '#111827',
  colorPlaceholder = '#9CA3AF',
  colorAccent = '#3B82F6',
  colorDanger = '#EF4444',
  modalTitle = 'Country / Region',
  searchPlaceholder = 'Search',
  showSearchIcon = true,
  searchIcon = '🔍',
  autoFocus,
  allowCountryPicker = true,
  onFocus,
  onBlur,
}) => {
  const [country, setCountry] = useState<CountryCode>(defaultCountry);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [inputValue, setInputValue] = useState<string>(value ?? '');
  const inputRef = useRef<TextInput>(null);

  // Sync external value prop with internal state
  React.useEffect(() => {
    if (value !== undefined && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  // Countries list memoized
  const countries = useMemo(() => getAllCountries(), []);

  // Compute phone data directly without state - avoiding useEffect completely
  const phoneData = useMemo(() => {
    const formatter = new AsYouType(country as LibCountryCode);
    const intlFormatted = formatter.input(inputValue);
    
    // Extract clean digits for validation
    const clean = clampDigits(intlFormatted);

    let e164: string | null = null;
    let isValid = false;
    
    try {
      const parsed = parsePhoneNumberFromString(clean, country as LibCountryCode);
      if (parsed) {
        isValid = parsed.isValid();
        if (isValid) e164 = parsed.number;
      }
    } catch {}

    return {
      raw: clean,
      display: intlFormatted,
      e164,
      isValid,
    };
  }, [inputValue, country]);

  const handleChangeText = useCallback(
    (text: string) => {
      // Let libphonenumber-js handle all formatting
      const formatter = new AsYouType(country as LibCountryCode);
      const formatted = formatter.input(text);
      
      // Update the input value with formatted text
      setInputValue(formatted);
      
      // Extract clean digits for validation
      const clean = clampDigits(formatted);
      
      // Compute phone data for onChange callback
      let e164: string | null = null;
      let isValid = false;
      
      try {
        const parsed = parsePhoneNumberFromString(clean, country as LibCountryCode);
        if (parsed) {
          isValid = parsed.isValid();
          if (isValid) e164 = parsed.number;
        }
      } catch {}

      const phoneValue: PhoneNumberInputValue = {
        raw: clean,
        international: formatted,
        e164,
        country,
        isValid,
      };
      
      onChange?.(phoneValue);
    },
    [country, onChange]
  );

  const openPicker = useCallback(() => {
    if (!allowCountryPicker || disabled) return;
    setPickerVisible(true);
  }, [allowCountryPicker, disabled]);

  const closePicker = useCallback(() => setPickerVisible(false), []);

  const onSelectCountry = useCallback((code: CountryCode) => {
    setCountry(code);
    setPickerVisible(false);
    
    // Reformat current input with new country
    const formatter = new AsYouType(code as LibCountryCode);
    const formatted = formatter.input(inputValue);
    
    setInputValue(formatted);
    
    // Extract clean digits for validation
    const clean = clampDigits(formatted);

    let e164: string | null = null;
    let isValid = false;
    
    try {
      const parsed = parsePhoneNumberFromString(clean, code as LibCountryCode);
      if (parsed) {
        isValid = parsed.isValid();
        if (isValid) e164 = parsed.number;
      }
    } catch {}

    const phoneValue: PhoneNumberInputValue = {
      raw: clean,
      international: formatted,
      e164,
      country: code,
      isValid,
    };
    
    onChange?.(phoneValue);
    
    // Refocus input
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [inputValue, onChange]);

  const borderColor: ColorValue = phoneData.isValid && phoneData.display ? colorAccent : colorBorder;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.inputRow, { backgroundColor: colorBackground, borderColor }]}>        
        <Pressable
          onPress={openPicker}
          disabled={!allowCountryPicker || disabled}
          style={[styles.countryButton, countryButtonStyle]}
          accessibilityRole="button"
          accessibilityLabel="Select country"
        >
          <Text style={[styles.flag, flagTextStyle]}>{isoToEmojiFlag(country)}</Text>
          <Text style={[styles.dialCode, { color: colorText }]}>+{getDialCode(countries, country)}</Text>
        </Pressable>

        <TextInput
          ref={inputRef}
          style={[styles.input, { color: colorText }, inputStyle]}
          value={inputValue}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={colorPlaceholder}
          editable={!disabled}
          inputMode="numeric"
          keyboardType="phone-pad"
          autoCorrect={false}
          autoCapitalize="none"
          autoFocus={autoFocus}
          onFocus={onFocus}
          onBlur={onBlur}
          accessibilityLabel="Phone number"
        />
      </View>

      <CountryPickerModal
        visible={pickerVisible}
        onClose={closePicker}
        onSelect={onSelectCountry}
        countries={countries}
        colorBackground={colorBackground}
        colorText={colorText}
        colorBorder={colorBorder}
        colorAccent={colorAccent}
        modalTitle={modalTitle}
        searchPlaceholder={searchPlaceholder}
        searchIcon={searchIcon}
        showSearchIcon={showSearchIcon}
      />

      {/* Status indicator */}
      {!!phoneData.display && (
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: phoneData.isValid ? colorAccent : colorDanger }]} />
          <Text style={[styles.statusText, { color: phoneData.isValid ? colorAccent : colorDanger }]}>
            {phoneData.isValid ? 'Valid phone number' : 'Invalid phone number'}
          </Text>
          {phoneData.e164 && (
            <Text style={[styles.e164Text, { color: colorPlaceholder }]}> • {phoneData.e164}</Text>
          )}
        </View>
      )}
    </View>
  );
};

// Get dial code for a given country
const getDialCode = (countries: Country[], code: CountryCode) => {
  const found = countries.find((c) => c.code === code);
  return found?.callingCode ?? '';
};

interface CountryPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (code: CountryCode) => void;
  countries: Country[];
  colorBackground: string;
  colorText: string;
  colorBorder: string;
  colorAccent: string;
  modalTitle: string;
  searchPlaceholder: string;
  searchIcon: string | null;
  showSearchIcon: boolean;
}

const CountryPickerModal: React.FC<CountryPickerModalProps> = ({ 
  visible, 
  onClose, 
  onSelect, 
  countries, 
  colorBackground, 
  colorText, 
  colorBorder, 
  colorAccent,
  modalTitle,
  searchPlaceholder,
  searchIcon,
  showSearchIcon
}) => {
  const [query, setQuery] = useState('');

  const filteredCountries = useMemo(() => {
    if (!query.trim()) return countries;
    const q = query.toLowerCase().trim();
    return countries.filter((c) => 
      c.name.toLowerCase().includes(q) || 
      c.code.toLowerCase().includes(q) || 
      c.callingCode.includes(q)
    );
  }, [countries, query]);

  const renderItem: ListRenderItem<Country> = useCallback(({ item }) => (
    <Pressable 
      style={[styles.countryItem, { 
        borderBottomColor: colorBorder, 
        backgroundColor: colorBackground 
      }]} 
      onPress={() => onSelect(item.code)} 
      accessibilityRole="button"
      accessibilityLabel={`Select ${item.name}, ${item.code}`}
    >
      <Text style={styles.countryFlag}>{item.flag}</Text>
      <View style={styles.countryInfo}>
        <Text style={[styles.countryName, { color: colorText }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.countryCode, { color: colorText, opacity: 0.6 }]}>
          {item.code}
        </Text>
      </View>
      <Text style={[styles.countryDialCode, { color: colorText, opacity: 0.8 }]}>
        +{item.callingCode}
      </Text>
    </Pressable>
  ), [onSelect, colorText, colorBorder, colorBackground]);

  const keyExtractor = useCallback((item: Country) => item.code, []);

  const getItemLayout = useCallback((_: any, index: number) => ({ 
    length: 64, 
    offset: 64 * index, 
    index 
  }), []);

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      onRequestClose={onClose} 
      presentationStyle="pageSheet"
    >
      <View style={[styles.modalContainer, { backgroundColor: colorBackground }]}>
        {/* Header - Apple HIG compliant */}
        <View style={[styles.modalHeader, { borderBottomColor: colorBorder, backgroundColor: colorBackground }]}>
          <Pressable 
            onPress={onClose} 
            style={styles.cancelButton}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.cancelButtonText, { color: colorAccent }]}>Cancel</Text>
          </Pressable>
          <Text style={[styles.modalTitle, { color: colorText }]}>
            {modalTitle}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        
        {/* Search Bar - Apple HIG style */}
        <View style={[styles.searchContainer, { backgroundColor: colorBackground }]}>
          <View style={[styles.searchInputContainer, { 
            backgroundColor: Platform.select({ 
              ios: 'rgba(118, 118, 128, 0.12)', 
              android: colorBorder,
              default: 'rgba(118, 118, 128, 0.12)'
            })
          }]}>
            {showSearchIcon && searchIcon && (
              <Text style={[styles.searchIcon, { color: 'rgba(118, 118, 128, 0.68)' }]}>
                {searchIcon}
              </Text>
            )}
            <TextInput
              style={[styles.searchInput, { color: colorText }]}
              placeholder={searchPlaceholder}
              placeholderTextColor="rgba(118, 118, 128, 0.68)"
              value={query}
              onChangeText={setQuery}
              autoFocus
              accessibilityLabel="Search countries"
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {query.length > 0 && Platform.OS === 'android' && (
              <Pressable onPress={() => setQuery('')} style={styles.clearButton}>
                <Text style={[styles.clearButtonText, { color: 'rgba(118, 118, 128, 0.68)' }]}>✕</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Countries List */}
        <FlatList
          data={filteredCountries}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          initialNumToRender={20}
          windowSize={10}
          maxToRenderPerBatch={30}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { 
    width: '100%' 
  },
  inputRow: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 80,
  },
  flag: { 
    fontSize: 18 
  },
  dialCode: { 
    fontSize: 15, 
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  input: { 
    flex: 1, 
    fontSize: 16, 
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 2,
  },
  statusIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '400',
  },
  e164Text: {
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.7,
  },

  // Modal Styles - Apple HIG compliant
  modalContainer: { 
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: Platform.select({ ios: 17, android: 16 }),
    borderBottomWidth: Platform.select({ ios: 0.33, android: 1 }),
  },
  cancelButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 60,
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.41,
  },
  modalTitle: {
    fontSize: Platform.select({ ios: 17, android: 20 }),
    fontWeight: Platform.select({ ios: '600', android: '700' }),
    letterSpacing: Platform.select({ ios: -0.41, android: 0.15 }),
    textAlign: 'center',
  },
  headerSpacer: {
    width: 60, // Balance the cancel button
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Platform.select({ ios: 10, android: 12 }),
    paddingHorizontal: Platform.select({ ios: 8, android: 16 }),
    paddingVertical: Platform.select({ ios: 7, android: 12 }),
    minHeight: Platform.select({ ios: 36, android: 48 }),
  },
  searchIcon: {
    fontSize: Platform.select({ ios: 17, android: 16 }),
    marginRight: Platform.select({ ios: 6, android: 12 }),
  },
  searchInput: { 
    flex: 1, 
    fontSize: Platform.select({ ios: 17, android: 16 }),
    fontWeight: '400',
    lineHeight: Platform.select({ ios: 22, android: 20 }),
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: Platform.select({ ios: 34, android: 20 }),
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: Platform.select({ ios: 11, android: 16 }),
    borderBottomWidth: Platform.select({ ios: 0.33, android: 0.5 }),
    minHeight: Platform.select({ ios: 44, android: 64 }),
  },
  countryFlag: {
    fontSize: Platform.select({ ios: 22, android: 24 }),
    marginRight: 12,
    width: Platform.select({ ios: 28, android: 32 }),
    textAlign: 'center',
  },
  countryInfo: {
    flex: 1,
    marginRight: 12,
    justifyContent: 'center',
  },
  countryName: { 
    fontSize: Platform.select({ ios: 17, android: 16 }),
    fontWeight: Platform.select({ ios: '400', android: '600' }),
    lineHeight: Platform.select({ ios: 22, android: 20 }),
    letterSpacing: Platform.select({ ios: -0.41, android: 0.15 }),
    marginBottom: Platform.select({ ios: 1, android: 2 }),
  },
  countryCode: {
    fontSize: Platform.select({ ios: 15, android: 13 }),
    fontWeight: Platform.select({ ios: '400', android: '500' }),
    lineHeight: Platform.select({ ios: 20, android: 16 }),
    letterSpacing: Platform.select({ ios: -0.24, android: 0.4 }),
  },
  countryDialCode: { 
    fontSize: Platform.select({ ios: 17, android: 16 }),
    fontWeight: Platform.select({ ios: '400', android: '600' }),
    letterSpacing: Platform.select({ ios: -0.41, android: 0.5 }),
    minWidth: Platform.select({ ios: 45, android: 50 }),
    textAlign: 'right',
  },
});

// Default export for backward compatibility with expo module template
export default function ExpoPhoneNumberInputView(props: PhoneNumberInputProps) {
  return <PhoneNumberInput {...props} />;
}
