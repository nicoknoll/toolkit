import { Booking, Cluster, Invoice } from '../api.ts';
import * as React from 'react';
import { useState } from 'react';
import { classnames, formatDate, formatMoney } from '@nicoknoll/utils';
import { Table } from '@nicoknoll/tables';
import { Checkbox } from '@nicoknoll/forms';
import MoneyBadge from './MoneyBadge.tsx';
import StatusBadge from './StatusBadge.tsx';
import {
    InvoiceCell,
    InvoiceRow,
    useInvoiceDeleteAction,
    useInvoiceEditAction,
    useInvoiceRemoveAllAssignmentsAction,
} from './InvoiceTable.tsx';
import {
    AssignableBookingRow,
    useBookingDeleteAction,
    useBookingEditAction,
    useBookingRemoveAllAssignmentsAction,
} from './BookingTable.tsx';
import MoreMenu from './MoreMenu.tsx';
import toast from 'react-hot-toast';
import Tooltip from './Tooltip.tsx';
import Skeleton from './Skeleton.tsx';
import { range } from 'lodash';

const ClusterInvoiceMoreMenu = ({ invoice, ...props }: { invoice: Invoice; [key: string]: any }) => {
    const removeAssignmentsAction = useInvoiceRemoveAllAssignmentsAction({ invoice });
    const editAction = useInvoiceEditAction({ invoice, isFormDisabled: true });
    const deleteAction = useInvoiceDeleteAction({ invoice });

    return (
        <>
            <MoreMenu>
                <MoreMenu.Item onClick={removeAssignmentsAction.onClick} className="flex flex-col items-start gap-0.5">
                    <span>Aus Gruppe entfernen</span>
                    <span className="text-xs text-neutral-400">Alle Zuordnungen zu Buchungen werden entfernt</span>
                </MoreMenu.Item>

                <MoreMenu.Item onClick={editAction.onClick}>Bearbeiten</MoreMenu.Item>

                <MoreMenu.Separator />

                <MoreMenu.Item onClick={deleteAction.onClick} danger>
                    Löschen
                </MoreMenu.Item>
            </MoreMenu>

            {editAction.renderDialog()}
        </>
    );
};

const ClusterBookingMoreMenu = ({ booking, ...props }: { booking: Booking; [key: string]: any }) => {
    const removeAssignmentsAction = useBookingRemoveAllAssignmentsAction({ booking });
    const editAction = useBookingEditAction({ booking });
    const deleteAction = useBookingDeleteAction({ booking });

    return (
        <>
            <MoreMenu>
                <MoreMenu.Item onClick={removeAssignmentsAction.onClick} className="flex flex-col items-start gap-0.5">
                    <span>Aus Gruppe entfernen</span>
                    <span className="text-xs text-neutral-400">Alle Zuordnungen zu Rechnungen werden entfernt</span>
                </MoreMenu.Item>

                <MoreMenu.Item onClick={editAction.onClick}>Bearbeiten</MoreMenu.Item>

                <MoreMenu.Separator />

                <MoreMenu.Item onClick={deleteAction.onClick} danger>
                    Löschen
                </MoreMenu.Item>
            </MoreMenu>

            {editAction.renderDialog()}
        </>
    );
};

const ClusterRows = ({ cluster }: { cluster: Cluster; [key: string]: any }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <ClusterHeaderRow onClick={handleClick} cluster={cluster} />

            {isOpen && (
                <>
                    {cluster.invoices.map((invoice) => (
                        <InvoiceRow
                            key={invoice.id}
                            invoice={invoice}
                            additionalCells={
                                <>
                                    <InvoiceCell>
                                        <div className="flex gap-2 justify-end">
                                            <ClusterInvoiceMoreMenu invoice={invoice} />
                                        </div>
                                    </InvoiceCell>
                                </>
                            }
                        />
                    ))}

                    {cluster.bookings.map((booking) => (
                        <AssignableBookingRow
                            key={booking.id}
                            booking={booking}
                            moreMenu={<ClusterBookingMoreMenu booking={booking} />}
                        />
                    ))}
                </>
            )}
        </>
    );
};

const ClusterHeaderRow = ({ cluster, ...props }: { cluster: Cluster; [key: string]: any }) => {
    const handleDifferenceClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        void navigator.clipboard.writeText(difference.toFixed(2));
        toast.success('Differenz kopiert');
    };

    const firstInvoice = cluster.invoices?.[0];
    const documentsCount = cluster.bookings.length + cluster.invoices.length;
    const difference = Math.abs(cluster.balance);

    const cellClassName = classnames('group-hover:bg-neutral-100 transition-colors');

    return (
        <Table.Row {...props} className="group cursor-pointer">
            <Table.Cell className={cellClassName}>
                <div className="flex gap-4 items-center py-1">
                    <div className="flex flex-col">
                        <div className="font-medium">{firstInvoice?.receiver || ''}</div>
                        <div className="text-neutral-500">{firstInvoice.description || ''}</div>
                    </div>
                    <div className="rounded-full bg-neutral-100 text-neutral-500 px-3 py-1 tabular-nums whitespace-nowrap">
                        {documentsCount} Dokumente
                    </div>
                </div>
            </Table.Cell>
            <Table.Cell className={cellClassName}>{formatDate(firstInvoice.date)}</Table.Cell>
            <Table.Cell className={classnames(cellClassName, 'text-right')}>
                <MoneyBadge amount={cluster.invoiceSum} highlight="neutral" />
            </Table.Cell>
            <Table.Cell className={classnames(cellClassName, 'text-right')}>
                <Tooltip>
                    <Tooltip.Trigger asChild>
                        <StatusBadge
                            status={cluster.status}
                            amount={cluster.invoiceSum}
                            onClick={handleDifferenceClick}
                        />
                    </Tooltip.Trigger>
                    <Tooltip.Content side="bottom" sideOffset={5} className="flex flex-col gap-0.5 px-3 py-2">
                        <span>Differenz: {formatMoney(difference)}</span>
                        <span className="text-xs text-neutral-300">Zum Kopieren anklicken</span>
                    </Tooltip.Content>
                </Tooltip>
            </Table.Cell>
        </Table.Row>
    );
};

const ClusterLoadingRow = () => (
    <Table.Row>
        <Table.Cell className="flex flex-col items-start justify-center gap-2">
            <Skeleton className="w-96" />
            <Skeleton className="w-[20rem]" />
        </Table.Cell>
        <Table.Cell>
            <Skeleton className="w-28" />
        </Table.Cell>
        <Table.Cell className="text-right">
            <Skeleton className="w-20" />
        </Table.Cell>
        <Table.Cell className="text-right">
            <Skeleton className="w-44" />
        </Table.Cell>
    </Table.Row>
);

const ClusterTable = ({ clusters, isLoading }: { clusters: Cluster[]; isLoading?: boolean }) => {
    const [filterBalanced, setFilterBalanced] = useState(true);

    const filteredClusters: Cluster[] = clusters?.filter((cluster: Cluster) => {
        if (!filterBalanced) return true;
        return cluster.status !== 'BALANCED';
    });

    return (
        <Table className="w-full">
            <Table.Head>
                <Table.Row>
                    <Table.HeadCell className="bg-neutral-900 border-neutral-900 text-white font-medium">
                        Dokument
                    </Table.HeadCell>
                    <Table.HeadCell className="bg-neutral-900 border-neutral-900 text-white font-medium w-48">
                        Datum
                    </Table.HeadCell>
                    <Table.HeadCell className="bg-neutral-900 border-neutral-900 text-white font-medium text-right w-60">
                        Betrag
                    </Table.HeadCell>
                    <Table.HeadCell className="bg-neutral-900 border-neutral-900 text-white font-medium text-right w-80">
                        <div className="flex justify-end items-center">
                            <Checkbox checked={filterBalanced} onChange={() => setFilterBalanced(!filterBalanced)} />
                        </div>
                    </Table.HeadCell>
                </Table.Row>
            </Table.Head>
            <Table.Body className={classnames(isLoading && 'opacity-50 pointer-events-none select-none')}>
                {isLoading && clusters.length === 0
                    ? range(10).map((i) => <ClusterLoadingRow key={i} />)
                    : filteredClusters.map((cluster: Cluster) => <ClusterRows key={cluster.id} cluster={cluster} />)}
            </Table.Body>
        </Table>
    );
};

export default React.memo(ClusterTable);
