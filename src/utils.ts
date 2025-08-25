import type { CountryCode } from './ExpoPhoneNumberInput.types';

export const isoToEmojiFlag = (iso: CountryCode): string => {
    if (!iso || iso.length !== 2) return '🏳️';
    const codePoints = iso
        .toUpperCase()
        .split('')
        .map((c) => 127397 + c.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
};

export const clampDigits = (value: string): string => value.replace(/[^0-9+]/g, '');
