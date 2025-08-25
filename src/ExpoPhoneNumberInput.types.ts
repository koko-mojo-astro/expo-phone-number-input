import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

export type CountryCode = string; // ISO 3166-1 alpha-2, e.g. 'US'

export interface PhoneNumberInputValue {
  raw: string; // what the user typed (digits and separators)
  international: string; // formatted for display (e.g., +1 213 555 1212)
  e164: string | null; // +12135551212 when valid
  country: CountryCode; // currently selected country
  isValid: boolean; // validity per libphonenumber rules
}

export interface PhoneNumberInputProps {
  value?: string; // initial raw value
  defaultCountry?: CountryCode; // default ISO country, e.g. 'US'
  disabled?: boolean;
  placeholder?: string;

  // Controlled formatting
  onChange?: (val: PhoneNumberInputValue) => void;

  // Appearance
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  countryButtonStyle?: StyleProp<ViewStyle>;
  flagTextStyle?: StyleProp<TextStyle>;

  // Colors (for theming)
  colorBackground?: string;
  colorBorder?: string;
  colorText?: string;
  colorPlaceholder?: string;
  colorAccent?: string; // used for focus and valid state
  colorDanger?: string; // used for invalid state

  // Modal customization
  modalTitle?: string; // custom modal title
  searchPlaceholder?: string; // custom search placeholder
  showSearchIcon?: boolean; // show/hide search icon
  searchIcon?: string; // custom search icon (emoji or text)

  // Behavior
  autoFocus?: boolean;
  allowCountryPicker?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

// For backward compatibility with expo module template
export interface ExpoPhoneNumberInputViewProps extends PhoneNumberInputProps { }