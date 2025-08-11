import antfu from '@antfu/eslint-config'

export default antfu({
  stylistic: {
    indent: 2,
    quotes: 'single',
    overrides: {
      'style/no-multiple-empty-lines': ['error', { max: 1 }],
    },
  },
  typescript: true,
  rules: {
    'antfu/no-top-level-await': 'off',
    'no-console': 'off',
    'perfectionist/sort-imports': ['warn', {
      groups: [
        'index-signature',
        'static-property',
        'private-property',
        'property',
        'constructor',
        'static-method',
        'private-method',
        'static-private-method',
        ['get-method', 'set-method'],
        'method',
        'unknown',
      ],
    }],
  },
})
