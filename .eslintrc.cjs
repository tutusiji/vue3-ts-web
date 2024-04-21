module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-essential',
    // 'vue-global-api'
  ],
  overrides: [
    {
      env: {
        node: true
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'vue'],
  rules: {
    // JavaScript/ESLint 推荐的规则
    'no-console': 'warn', // 不允许使用 console.log 等
    'no-unused-vars': 'warn', // 不允许存在未使用的变量
    'no-undef': 'error', // 不允许使用未定义的变量
    // Vue/ESLint 推荐的规则
    'vue/html-indent': 0, // HTML 缩进为 2 个空格
    'vue/attribute-hyphenation': 'error', // 属性名使用连字符形式
    'vue/html-self-closing': 'off', // 关闭自闭合标签要求，根据个人或团队喜好配置
    'vue/max-attributes-per-line': 0,
    'vue/no-v-html': 'off', // 允许使用 v-html 指令
    'vue/no-unused-components': 'warn', // 不允许存在未使用的组件
    // TypeScript/ESLint 推荐的规则
    '@typescript-eslint/no-unused-vars': 'warn', // 不允许存在未使用的 TypeScript 变量
    '@typescript-eslint/explicit-module-boundary-types': 'off', // 允许不显式指定导出函数的返回类型
    '@typescript-eslint/no-explicit-any': 'off' // 允许使用 any 类型
  }
}
