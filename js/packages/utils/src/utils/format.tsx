import { isObject } from 'lodash';

export const formatDate = (date: Date | string, locale = 'de-DE') => {
    return new Date(date).toLocaleDateString(locale, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
};

export const formatDateShort = (date: Date | string, locale = 'de-DE') => {
    return new Date(date).toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

export const formatMoney = (amount: number, currency = 'EUR', locale = 'de-DE') => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
    }).format(amount);
};

export const formatAddress = (address: string, city: string, postcode: string, options: any = {}) => {
    const lineDivider = options?.lineDivider || ',\n';
    if (isObject(lineDivider)) {
        return (
            <>
                {address}
                {lineDivider}
                {postcode} {city}
            </>
        );
    } else {
        return `${address}${lineDivider}${postcode} ${city}`;
    }
};

export const formatDecimal = (value: number, options = {}, locale = 'de-DE') => {
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        ...options,
    }).format(value);
};

export const formatAge = (date: Date | string) => {
    date = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const month = today.getMonth() - date.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < date.getDate())) {
        return age - 1;
    }
    return age;
};
