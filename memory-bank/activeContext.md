# Active Context: Dream Journal Mobile

## Current Status

✅ **Swipe to Delete** - Implemented on "My Dreams" AND "Calendar".
✅ **Dream Visualization** - Working via Pollinations.ai.
✅ **UI Polish** - Fixed content flashing, cleaner Dream Detail view.
✅ **Calendar Features** - Vibrant visuals + interactive management.

## Recent Changes (Dec 31, 2024)

### Swipe to Delete 🧹

- Shared `SwipeableDreamItem` component.
- Integrated into `CalendarScreen` & `DreamListScreen`.
- Fixed syntax errors and import duplications in Calendar.

### UI/UX Polish ✨

- Fixed "previous dream flash" issue on Dream Detail screen.
- Removed redundant "Notes" and "Interpretation" headers.
- Verified correct state management for dream selection.

### Dream Visualization 🎨

- Pollinations.ai integration (Free/Unlimited).
- "Visualize Dream" button with loading state.

## Dependencies

`expo-router`, `zustand`, `firebase`, `react-native-calendars`, `expo-linear-gradient`, `react-native-gesture-handler`

## Next Steps

1. [ ] Dream statistics.
2. [ ] Google Sign-In.
3. [ ] Improve image quality/speed (considering paid options).
