# DailyWin - React Native

This is a new version of the DailyWin application, rebuilt from the ground up using React Native and Expo. It replicates and enhances the functionality of the original native Android application.

## Overview

This project is a habit tracking application that allows users to create, manage, and track their habits. It includes features such as user authentication, habit tracking, statistics, a calendar view, and multi-language support.

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- Expo Go app on your mobile device

### Installation

1. Clone the repository.
2. Navigate to the `DailyWin` directory.
3. Install the dependencies: `npm install`
4. Start the development server: `npm start`
5. Scan the QR code with the Expo Go app on your device.

## Firebase Configuration

This project uses Firebase for authentication and data storage. The necessary Firebase configuration has been extracted from the original Android project's `google-services.json` file and is included in `services/firebaseConfig.js`.

**Note:** The web `appId` in the configuration is an example. For full functionality, you may need to generate a new web app configuration in the Firebase console and update the `appId` in `services/firebaseConfig.js`.

## Project Structure

- `app/`: Contains the screens of the application, using Expo Router for file-based routing.
- `assets/`: Contains static assets like images and fonts.
- `components/`: Contains reusable components.
- `context/`: Contains context providers, such as the `ThemeProvider`.
- `hooks/`: Contains custom hooks, such as `useTheme` and `useNotifications`.
- `locales/`: Contains the translation files for multi-language support.
- `navigation/`: Contains the navigation setup (though Expo Router is the primary method).
- `services/`: Contains the Firebase configuration and initialization, as well as the i18n setup.
- `utils/`: Contains utility functions.
