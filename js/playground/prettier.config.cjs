module.exports = {
    plugins: [require("@trivago/prettier-plugin-sort-imports")],
    semi: true,
    singleQuote: true,
    tabWidth: 4,
    trailingComma: 'es5',
    printWidth: 120,
    "importOrder": ["^@(.*)$", "^[./]"],
    "importOrderSeparation": true,
    "importOrderSortSpecifiers": true
};

