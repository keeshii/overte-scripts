module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:es5/no-es2015'
  ],
  plugins: [
    'es5'
  ],
  globals: {
    'module': 'writeable',
    'Script': 'readonly',
    'Entities': 'readonly',
    'MyAvatar': 'readonly',
    'Selection': 'readonly',
    'Vec3': 'readonly'
  }
};
