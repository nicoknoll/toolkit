import * as React from 'react';
import { classnames } from '@nicoknoll/utils';

const Table = ({ className, ...props }: React.ComponentPropsWithRef<'table'>) => {
    return (
        <table
            className={classnames(
                'table-fixed border-separate border border-neutral-200 border-solid rounded-lg border-spacing-0',
                className
            )}
            {...props}
        />
    );
};

const TableHead = ({ className, ...props }: React.ComponentPropsWithRef<'thead'>) => {
    return <thead className={classnames('', className)} {...props} />;
};

const TableBody = ({ className, ...props }: React.ComponentPropsWithRef<'tbody'>) => {
    return <tbody className={classnames('', className)} {...props} />;
};

const TableRow = ({ className, ...props }: React.ComponentPropsWithRef<'tr'>) => {
    return <tr className={classnames('group border-b border-neutral-200 border-solid', className)} {...props} />;
};

interface TableCellProps extends React.ComponentPropsWithRef<'td'> {
    sticky?: boolean | 'left' | 'right';
}

const TableCell = ({ className, sticky, ...props }: TableCellProps) => {
    return (
        <td
            className={classnames(
                'px-4 py-2 h-14 bg-white text-neutral-900 align-middle text-sm border-b border-neutral-200 border-solid group-last:border-b-0 group-last:first:rounded-bl-lg group-last:last:rounded-br-lg',
                sticky ? (sticky === 'right' ? 'sticky right-0' : 'sticky left-0') : '',
                className
            )}
            {...props}
        />
    );
};

interface TableHeadCellProps extends React.ComponentPropsWithRef<'th'> {
    sticky?: boolean | 'left' | 'right';
}

const TableHeadCell = ({ className, sticky, ...props }: TableHeadCellProps) => {
    return (
        <th
            className={classnames(
                'p-4 py-3 text-neutral-500 font-normal align-middle text-left text-sm border-b border-neutral-200 border-solid bg-neutral-50 first:rounded-tl-lg last:rounded-tr-lg',
                sticky ? (sticky === 'right' ? 'sticky right-0' : 'sticky left-0') : '',
                className
            )}
            {...props}
        />
    );
};

export default Object.assign(Table, {
    Head: TableHead,
    Body: TableBody,
    Row: TableRow,
    Cell: TableCell,
    HeadCell: TableHeadCell,
});
