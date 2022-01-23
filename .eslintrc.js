module.exports = {
  parser: 'vue-eslint-parser',
  plugins: ['import', 'vue'],
  root: true,
  env: {
    // this section will be used to determine which APIs are available to us
    // (i.e are we running in a browser environment or a node.js env)
    node: true,
    browser: true
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
    requireConfigFile: false,
    // specifying a module sourcetype prevent eslint from marking import statements as errors
    sourceType: 'module'
  },
  extends: [
    // use the recommended rule set for both plain javascript and vue
    // 'vue',
    'standard',
    'eslint:recommended',
    'plugin:vue/recommended',
    'plugin:vue/vue3-recommended'
  ],
  rules: {
    // we should always disable console logs and debugging in production
    // 'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'space-before-function-paren': 'off',
    'space-infix-ops': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    'no-multi-spaces': 'off',
    'vue/no-multiple-template-root': 'off',
    "vue/singleline-html-element-content-newline": "off",
    'vue/comment-directive': 'off',
    'vue/html-self-closing': 'off',
    'no-unused-vars': 'warn',
    'vue/max-attributes-per-line': 'off',
    'vue/require-default-prop': 'off',
    'indent': 'warn'
  }
}
