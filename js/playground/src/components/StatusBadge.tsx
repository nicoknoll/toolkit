import * as React from 'react';
import { classnames } from '@nicoknoll/utils';
import { CheckCheckIcon, TriangleAlertIcon } from 'lucide-react';

const StatusBadge = ({
    status,
    amount,
    className,
    ...props
}: React.ComponentPropsWithRef<'span'> & { status: string; amount: number }) => {
    const isIncoming = parseFloat(amount.toString()) > 0;

    const statusMap: Record<string, string> = {
        UNDERPAID: isIncoming ? 'Zu wenig erhalten' : 'Zu wenig gezahlt',
        OVERPAID: isIncoming ? 'Zu viel erhalten' : 'Zu viel gezahlt',
    };
    const statusText = statusMap[status] || 'Gebucht';

    return (
        <span
            className={classnames(
                'rounded-full px-3 py-1 font-medium tabular-nums inline-flex items-center gap-1',
                status === 'UNDERPAID' && 'bg-yellow-100 text-yellow-700',
                status === 'OVERPAID' && 'bg-yellow-100 text-yellow-700',
                status === 'BALANCED' && 'bg-green-100 text-green-700',
                className
            )}
            {...props}
        >
            {status === 'BALANCED' ? <CheckCheckIcon /> : <TriangleAlertIcon />}
            {statusText}
        </span>
    );
};

export default StatusBadge;
