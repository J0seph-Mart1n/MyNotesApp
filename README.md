# MyNotesApp

MyNotesApp is a React Native journaling and note-taking application built with Expo. It provides a robust and modernized interface for managing your daily notes and diary entries with local data persistence.

## Features

- **Expo SDK 55**: Modernized and built on the latest Expo framework.
- **Local Persistence**: Powered by SQLite (`expo-sqlite`) for secure and reliable on-device storage.
- **Drawer Navigation**: Implemented robust and standardized side-drawer navigation using `@react-navigation/drawer` and `expo-router`.
- **Note Management**:
  - Pinned and unpinned note sections.
  - Multi-selection long-press deletion.
  - Consistent data management across text and list-based journal entries.
- **Native UI Components**: Incorporates `@react-native-community/datetimepicker` for a native date-picking experience.

## Get Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the app**

   ```bash
   npm run start
   ```

3. **Run on specific platforms**
   - Android: `npm run android`
   - iOS: `npm run ios`
   - Web: `npm run web`

## Tech Stack

- [Expo](https://expo.dev/) (SDK 55)
- [React Native](https://reactnative.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [React Navigation](https://reactnavigation.org/)
- [Reanimated](https://docs.swmansion.com/react-native-reanimated/) & [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)

## Project Structure

- `/app`: Contains file-based routing and main screens for the application.
- `/components`: Reusable UI components.
- `/constants`: Global constants and configurations.
- `/hooks`: Custom React hooks.
- `/scripts`: Utility scripts.
- `/assets`: Images, fonts, and other static assets.
