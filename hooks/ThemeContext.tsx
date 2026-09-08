import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Define the colors for Light and Dark modes
export const themeColors = {
  light: {
    background: '#EAEAEA',
    card: '#F5F5F5',
    text: '#2C2C2E',
    subText: '#666666',
    border: '#D1D1D6',
    tint: '#007AFF',
    inputBg: '#F5F5F5',
    modalBg: '#F5F5F5',
    placeholder: '#8E8E93',
    green: '#3BA78F',
    saveBtn: '#121212'
  },
  dark: {
    background: '#121212',
    card: '#2c2b2b',
    text: '#FFFFFF',
    subText: '#AAAAAA',
    border: '#333333',
    tint: '#0A84FF',
    inputBg: '#2C2C2C',
    modalBg: '#1E1E1E',
    placeholder: '#AAAAAA',
    green: '#136b55',
    saveBtn: '#FFFFFF'
  },
};

type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  theme: ThemeMode;
  toggleTheme: () => void;
  colors: typeof themeColors.light;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => { },
  colors: themeColors.light,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme() as 'light' | 'dark' | null;
  const [theme, setTheme] = useState<ThemeMode>(systemScheme || 'light');

  // Load saved preference on startup
  useEffect(() => {
    const loadTheme = async () => {
      setTheme('dark');
    };
    loadTheme();
  }, []);

  // Toggle function
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const colors = themeColors[theme];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for easy access
export const useTheme = () => useContext(ThemeContext);