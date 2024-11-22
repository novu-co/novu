import { type CSSInterpolation } from '@emotion/css';

import { type ColorScheme } from '../shared/config/colors';
import { type ICommonTheme } from '../store/novu-theme-provider.context';
import { type INovuTheme } from '../store/novu-theme.context';

export type CSSFunctionInterpolation = (args: {
  theme: INovuTheme;
  common: ICommonTheme;
  colorScheme: ColorScheme;
}) => CSSInterpolation;

export type CSSFunctionOrObject = CSSFunctionInterpolation | CSSInterpolation;

export type ObjectWithRoot<T = {}> = T & {
  root?: CSSFunctionOrObject;
};
