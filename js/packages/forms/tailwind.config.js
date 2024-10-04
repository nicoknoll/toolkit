/** @type {import('tailwindcss').Config} */

const plugin = require('tailwindcss/plugin');
const colors = require('tailwindcss/colors');

export default {
    content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
    theme: {
        extend: {
            boxShadow: {
                'inner-sm': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            },
            textShadow: {
                sm: '0 1px 2px var(--tw-shadow-color)',
                DEFAULT: '0 2px 4px var(--tw-shadow-color)',
                lg: '0 8px 16px var(--tw-shadow-color)',
            },
            outlineWidth: {
                3: '3px',
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
            },
        },
        colors: {
            theme: colors.blue,
            accent: colors.rose,
            error: colors.red,
            neutral: colors.neutral,
            white: colors.white,
            black: colors.black,
            transparent: colors.transparent,
        },
    },
    plugins: [
        require('tailwindcss-radix')({
            // Default: `radix`
            variantPrefix: 'ui',
        }),
        plugin(function ({ addUtilities }) {
            addUtilities(
                {
                    '.scrollbar': {
                        'scrollbar-width': 'auto',
                        '&::-webkit-scrollbar': {
                            width: '16px',
                        },
                    },
                    '.scrollbar-thin': {
                        'scrollbar-width': 'thin',
                        '&::-webkit-scrollbar': {
                            width: '8px',
                        },
                    },
                    '.scrollbar-none': {
                        'scrollbar-width': 'none',
                        '&::-webkit-scrollbar': {
                            display: 'none',
                        },
                    },
                },
                ['responsive']
            );
        }),
        plugin(function ({ matchUtilities, theme }) {
            matchUtilities(
                {
                    'text-shadow': (value) => ({
                        textShadow: value,
                    }),
                },
                { values: theme('textShadow') }
            );
        }),
        plugin(function ({ addVariant, e }) {
            addVariant('ui-invalid', ({ modifySelectors, separator }) => {
                modifySelectors(({ className }) => {
                    return `[data-invalid] .${e(`ui-invalid${separator}${className}`)}`;
                });
            });
        }),
    ],
};
