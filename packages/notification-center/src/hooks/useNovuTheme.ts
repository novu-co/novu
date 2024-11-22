import { useContext } from 'react';
import { type ColorScheme, type ICommonTheme } from '../index';
import { type INovuTheme, ThemeContext } from '../store/novu-theme.context';

export function useNovuTheme(): {
  theme: INovuTheme;
  common: ICommonTheme;
  colorScheme: ColorScheme;
} {
  const { colorScheme, theme, common } = useContext(ThemeContext);

  return {
    colorScheme,
    theme,
    common,
  };
}
