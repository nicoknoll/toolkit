import * as React from 'react';
import { classnames, formatMoney } from '@nicoknoll/utils';

const MoneyBadge = ({ amount, highlight, ...props }: any) => {
    return (
        <span
            className={classnames(
                'bg-neutral-100 text-neutral-700 px-2 py-1 rounded tabular-nums',
                ((!highlight && amount > 0) || highlight === 'positive') && 'bg-green-100 text-green-700',
                ((!highlight && amount < 0) || highlight === 'negative') && 'bg-red-100 text-red-700'
            )}
            {...props}
        >
            {formatMoney(amount)}
        </span>
    );
};

export default MoneyBadge;
