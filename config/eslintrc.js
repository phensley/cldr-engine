module.exports = {
  extends: [
    "plugin:@typescript-eslint/recommended",
//    "prettier/@typescript-eslint",
    "plugin:prettier/recommended"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module"
  },
  rules: {
    "max-len": [
      "error",
      { code: 120 }
    ],
    "prefer-const": "off", // typescript compiler catches this and is more flexible
    "@typescript-eslint/camelcase": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-duplicate-enum-values": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-empty-object-type": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/triple-slash-reference": "off",
    "@typescript-eslint/no-this-alias": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_.*$" }
    ],
    "@typescript-eslint/no-use-before-define": "off",
    // warn prettier for now
    "prettier/prettier": "warn",
  },
  settings: {
  }
}

