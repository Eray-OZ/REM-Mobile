# Active Context: Dream Journal Mobile

## Current Status

✅ **Calendar View Added** - Dreams shown by date with category-colored dots.
✅ **Date Selection** - Users can select a date when adding dreams.
✅ **Sorting Fixed** - Dreams added "Today" appear at the top (preserve time).
✅ **Navigation Fixed** - Deleting a dream safely returns to the main tab.

## Recent Changes (Dec 31, 2024)

### UI/UX Refinements

- **Profile Icon**: Moved to header in Home and Calendar screens.
- **Tab Bar**: 3 items (Dreams, Add, Calendar). Profile removed from tab bar.
- **Sorting**: Dreams added for "Today" now use `serverTimestamp()` to ensure they appear at the top of the list. Backdated dreams appear chronologically.
- **Navigation**: Fixed crash when deleting a dream by using `router.replace('/(tabs)')`.

### Date Selection

- Added date picker to Add Dream screen.
- Defaults to today's date.
- Future dates disabled.

### Calendar Feature

- `app/(tabs)/calendar.jsx` with category-colored dots.
- `CATEGORY_COLORS` mapping handling English IDs.

## Dependencies

`expo-router`, `zustand`, `firebase`, `expo-linear-gradient`, `expo-blur`, `react-native-calendars`

## Next Steps

1. [ ] Dream editing
2. [ ] Google Sign-In
3. [ ] Dream statistics
