import { FC, useState, createContext, useEffect } from 'react';
import { StyledEngineProvider, ThemeProvider } from '@mui/material';
import { themeCreator } from './base';

export const ThemeContext = createContext((_themeName: string): void => {});

const ThemeProviderWrapper: FC = (props) => {
  const [themeName, _setThemeName] = useState('PureLightTheme');

  useEffect(() => {
    const curThemeName =
      window.localStorage.getItem('appTheme') || 'PureLightTheme';
    _setThemeName(curThemeName);
  }, []);

  const theme = themeCreator(themeName);
  const setThemeName = (themeName: string): void => {
    window.localStorage.setItem('appTheme', themeName);
    _setThemeName(themeName);
  };
  // @ts-ignore
  return (
    <>
      {/* @ts-ignore */}
      <StyledEngineProvider injectFirst>
        {/* @ts-ignore */}
        <ThemeContext.Provider value={setThemeName}>
          {/* @ts-ignore */}
          <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
        </ThemeContext.Provider>
      </StyledEngineProvider>
    </>
  );
};

export default ThemeProviderWrapper;
