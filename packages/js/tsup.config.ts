import { compress } from 'esbuild-plugin-compress';
import { solidPlugin } from 'esbuild-plugin-solid';
import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import loadPostcssConfig from 'postcss-load-config';
import { defineConfig, Options } from 'tsup';
import { name, version } from './package.json';

const processCSS = async (css: string, filePath: string) => {
  const { plugins, options } = await loadPostcssConfig({}, filePath);
  const result = await postcss(plugins).process(css, { ...options, from: filePath });

  return result.css;
};

const buildCSS = async () => {
  const cssFilePath = path.join(__dirname, './src/ui/index.css');
  const destinationCssFilePath = path.join(__dirname, './dist/index.css');
  const css = fs.readFileSync(cssFilePath, 'utf-8');
  const processedCss = await processCSS(css, cssFilePath);
  fs.writeFileSync(destinationCssFilePath, processedCss);
};

const isProd = process.env.NODE_ENV === 'production';

const baseConfig: Options = {
  splitting: true,
  sourcemap: false,
  clean: true,
  esbuildPlugins: [solidPlugin()],
};

const baseModuleConfig: Options = {
  ...baseConfig,
  treeshake: true,
  dts: true,
  entry: {
    index: './src/index.ts',
    'ui/index': './src/ui/index.ts',
    'ui/server/index': './src/ui/server.ts',
    'themes/index': './src/ui/themes/index.ts',
    'internal/index': './src/ui/internal/index.ts',
  },
  define: {
    NOVU_API_VERSION: `"2024-06-26"`,
    PACKAGE_NAME: `"${name}"`,
    PACKAGE_VERSION: `"${version}"`,
    __DEV__: `${isProd ? false : true}`,
  },
};

export default defineConfig((config: Options) => {
  const cjs: Options = {
    ...baseModuleConfig,
    format: 'cjs',
    outDir: 'dist/cjs',
    tsconfig: 'tsconfig.cjs.json',
  };

  const esm: Options = {
    ...baseModuleConfig,
    format: 'esm',
    outDir: 'dist/esm',
    tsconfig: 'tsconfig.json',
  };

  const umd: Options = {
    ...baseConfig,
    entry: { novu: 'src/umd.ts' },
    format: ['iife'],
    minify: true,
    dts: false,
    outExtension: () => {
      return {
        js: '.min.js',
      };
    },
    esbuildPlugins: [
      ...(baseConfig.esbuildPlugins ? baseConfig.esbuildPlugins : []),
      compress({
        gzip: true,
        brotli: false,
        outputDir: '.',
        exclude: ['**/*.map'],
      }),
    ],
    onSuccess: async () => await buildCSS(),
  };

  return [cjs, esm, umd];
});
