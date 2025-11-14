module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: false,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./frontend/tsconfig.eslint.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
    'security',
    'tailwindcss',
  ],
  extends: [
    'airbnb',
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:security/recommended',
    'plugin:tailwindcss/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'prettier',
  ],
  settings: {
    react: {
      version: 'detect',
    },
    tailwindcss: {
      config: 'frontend/tailwind.config.ts',
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],
    'tailwindcss/classnames-order': 'off',
    'security/detect-object-injection': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          'frontend/tests/**',
          '**/*.test.tsx',
          '**/*.test.ts',
          'frontend/vite.config.ts',
          'frontend/tailwind.config.ts',
          'frontend/postcss.config.cjs',
          'frontend/jest.config.cjs',
        ],
      },
    ],
  },
  ignorePatterns: ['*.config.{js,cjs,mjs}', 'frontend/tests/playwright.config.ts'],
};
