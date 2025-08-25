// Export the main phone number input component
export { PhoneNumberInput } from './ExpoPhoneNumberInputView';
export { default as ExpoPhoneNumberInputView } from './ExpoPhoneNumberInputView';

// Export types
export type {
    PhoneNumberInputProps,
    PhoneNumberInputValue,
    CountryCode,
    ExpoPhoneNumberInputViewProps
} from './ExpoPhoneNumberInput.types';

// Export utilities for advanced usage
export { getAllCountries } from './countries';
export type { Country } from './countries';
export { isoToEmojiFlag, clampDigits } from './utils';