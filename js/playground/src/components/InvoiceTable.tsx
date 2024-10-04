import { Table } from '@nicoknoll/tables';
import api, { BatchTransferItem, Invoice } from '../api.ts';
import { classnames, formatDate } from '@nicoknoll/utils';
import Button from '../../../packages/forms/src/misc/Button.tsx';
import { BookmarkPlusIcon, FileIcon } from 'lucide-react';
import * as React from 'react';
import { useMemo, useState } from 'react';
import MoneyBadge from './MoneyBadge.tsx';
import { invoiceToBatchTransferItem, useBatchTransferDrawer } from './BatchTransferDrawer.tsx';
import { Checkbox } from '@nicoknoll/forms';
import MoreMenu from './MoreMenu.tsx';
import { useConfirmationDialogContext } from './ConfirmationDialog.tsx';
import EditInvoiceDialog from './EditInvoiceDialog.tsx';
import toast from 'react-hot-toast';
import { useData } from '../data.tsx';
import Skeleton from './Skeleton.tsx';
import { range } from 'lodash';

const InvoiceContext = React.createContext<Invoice | null>(null);
const useInvoiceContext = () => React.useContext(InvoiceContext);

export const useInvoiceRemoveAllAssignmentsAction = ({ invoice }: { invoice: Invoice }) => {
    const confirm = useConfirmationDialogContext();

    const [_, { refetch }] = useData();

    const handleRemove = async () => {
        const data = await api.invoices.putAssignments(invoice.id, []);
        toast.success('Rechnung erfolgreich grspeichert');
        await refetch();
        return data;
    };

    const handleClick = () => {
        return confirm('Möchtest du die Zuweisungen wirklich entfernen?', null, {
            onConfirm: handleRemove,
            danger: true,
            className: 'w-[50rem]',
        });
    };

    return {
        onClick: handleClick,
    };
};

export const useInvoiceEditAction = ({
    invoice,
    isFormDisabled = false,
}: {
    invoice: Invoice;
    isFormDisabled?: boolean;
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const [, { refetch }] = useData();

    const handleClick = () => {
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleSubmit = async (values: any) => {
        const data = await api.invoices.update(invoice.id, values);
        toast.success('Rechnung erfolgreich gespeichert');
        await refetch();
        setIsOpen(false);
        return data;
    };

    const getInvoiceData = (invoice: Invoice) => {
        return {
            ...invoice,
            file: invoice.fileUrl
                ? {
                      name: invoice.fileUrl.split('/').reverse()[0],
                      url: invoice.fileUrl,
                  }
                : undefined,
            total: invoice?.total?.toString() || '',
            taxRate: invoice?.taxRate?.toString() || '',
        };
    };

    const invoiceData = useMemo(() => getInvoiceData(invoice), [invoice]);
    const renderDialog = () => {
        if (!isOpen) return null;

        return (
            <EditInvoiceDialog
                isOpen={isOpen}
                onIsOpenChange={setIsOpen}
                invoiceData={invoiceData}
                onSubmit={handleSubmit}
                onCancel={handleClose}
                isFormDisabled={isFormDisabled}
            />
        );
    };

    return {
        onClick: handleClick,
        renderDialog,
    };
};

export const useInvoiceDeleteAction = ({ invoice }: { invoice: Invoice }) => {
    const confirm = useConfirmationDialogContext();

    const [, { refetch }] = useData();

    const handleDelete = async () => {
        await api.invoices.delete(invoice.id);
        toast.success('Rechnung erfolgreich gelöscht');
        await refetch();
    };

    const handleClick = () => {
        return confirm(
            'Möchtest du die Rechnung wirklich löschen?',
            <Table className="w-full">
                <colgroup>
                    <col />
                    <col className="w-52" />
                    <col className="w-32" />
                </colgroup>

                <Table.Body>
                    <InvoiceRow invoice={invoice} />
                </Table.Body>
            </Table>,
            {
                onConfirm: handleDelete,
                danger: true,
                className: 'w-[50rem]',
            }
        );
    };

    return {
        onClick: handleClick,
    };
};

export const InvoiceCell = ({ className, ...props }: { className?: string; [key: string]: any }) => (
    <Table.Cell className={classnames('bg-neutral-50', className)} {...props} />
);

export const InvoiceRow = ({
    invoice,
    cellClassName,
    additionalCells,
    ...props
}: {
    invoice: Invoice;
    cellClassName?: string;
    additionalCells?: any;
    [key: string]: any;
}) => {
    return (
        <InvoiceContext.Provider value={invoice}>
            <Table.Row {...props}>
                <InvoiceCell className={cellClassName}>
                    <div className="flex gap-4 items-center py-1">
                        <div className="text-neutral-400">
                            <FileIcon />
                        </div>
                        <div className="flex flex-col">
                            <div className="font-medium">{invoice.receiver || ''}</div>
                            <div className="text-neutral-500">
                                {invoice.invoiceNumber && `[${invoice.invoiceNumber}]`} {invoice.description || ''}{' '}
                                {invoice.fileUrl ? (
                                    <>
                                        -{' '}
                                        <a
                                            href={invoice.fileUrl}
                                            target="_blank"
                                            className="text-blue-500 hover:underline"
                                        >
                                            Datei ansehen
                                        </a>
                                    </>
                                ) : (
                                    ''
                                )}
                            </div>
                        </div>
                    </div>
                </InvoiceCell>
                <InvoiceCell className={cellClassName}>{invoice.date && formatDate(invoice.date)}</InvoiceCell>
                <InvoiceCell className={classnames('text-right', cellClassName)}>
                    <MoneyBadge amount={invoice.isExpense ? -1 * invoice.total : invoice.total} />
                </InvoiceCell>
                {additionalCells}
            </Table.Row>
        </InvoiceContext.Provider>
    );
};

const ActionableInvoiceRow = ({ invoice, cellClassName, ...props }: any) => {
    const { items: drawerItems, setIsOpen: setDrawerIsOpen, setFormItem: setDrawerFormItem } = useBatchTransferDrawer();
    const drawerItemIds = drawerItems.map((item: BatchTransferItem) => item.id);

    const editAction = useInvoiceEditAction({ invoice, isFormDisabled: true });
    const deleteAction = useInvoiceDeleteAction({ invoice });

    const total = invoice.isExpense ? -1 * invoice.total : invoice.total;

    const moreMenu = (
        <MoreMenu>
            <MoreMenu.Item onClick={editAction.onClick}>Bearbeiten</MoreMenu.Item>

            <MoreMenu.Separator />

            <MoreMenu.Item onClick={deleteAction.onClick} danger>
                Löschen
            </MoreMenu.Item>
        </MoreMenu>
    );

    const additionalCells =
        total > 0 ? (
            <>
                <InvoiceCell className="bg-white text-right">
                    <div className="flex gap-2 justify-end">{moreMenu}</div>
                </InvoiceCell>
            </>
        ) : (
            <>
                <InvoiceCell className="bg-white text-right">
                    <div className="flex gap-2 justify-end">
                        <Button
                            className="inline-flex gap-1 items-center"
                            onClick={() => {
                                const drawerItem = invoiceToBatchTransferItem(invoice);
                                setDrawerIsOpen(true);
                                setDrawerFormItem(drawerItem);
                            }}
                            disabled={drawerItemIds.includes(invoice.id) || invoice.assignmentStatus === 'ASSIGNED'}
                        >
                            <BookmarkPlusIcon />
                            Zu Sammler hinzufügen
                        </Button>

                        {moreMenu}
                    </div>
                </InvoiceCell>
            </>
        );

    return (
        <>
            <InvoiceRow key={invoice.id} invoice={invoice} cellClassName="bg-white" additionalCells={additionalCells} />

            {editAction.renderDialog()}
        </>
    );
};

const InvoiceLoadingRow = () => (
    <Table.Row>
        <Table.Cell className="flex flex-col items-start justify-center gap-2 pl-12">
            <Skeleton className="w-96" />
            <Skeleton className="w-[20rem]" />
        </Table.Cell>
        <Table.Cell>
            <Skeleton className="w-28" />
        </Table.Cell>
        <Table.Cell className="text-right">
            <Skeleton className="w-20" />
        </Table.Cell>
        <Table.Cell className="text-right pr-14">
            <Skeleton className="w-44" />
        </Table.Cell>
    </Table.Row>
);

const InvoiceTable = ({ invoices, isLoading }: { invoices: Invoice[]; isLoading?: boolean }) => {
    const [filterUnassigned, setFilterUnassigned] = useState(true);

    const filteredInvoices = filterUnassigned
        ? invoices.filter((invoice: Invoice) => invoice.assignmentStatus !== 'ASSIGNED')
        : invoices;

    return (
        <Table className="w-full">
            <Table.Head>
                <Table.Row>
                    <Table.HeadCell className="bg-neutral-900 border-neutral-900 text-white font-medium">
                        Rechnung / Beleg
                    </Table.HeadCell>
                    <Table.HeadCell className="bg-neutral-900 border-neutral-900 text-white font-medium w-48">
                        Datum
                    </Table.HeadCell>
                    <Table.HeadCell className="bg-neutral-900 border-neutral-900 text-white font-medium text-right w-60">
                        Betrag
                    </Table.HeadCell>
                    <Table.HeadCell className="bg-neutral-900 border-neutral-900 text-white font-medium text-right w-80">
                        <div className="flex justify-end items-center">
                            <Checkbox
                                checked={filterUnassigned}
                                onChange={() => setFilterUnassigned(!filterUnassigned)}
                            />
                        </div>
                    </Table.HeadCell>
                </Table.Row>
            </Table.Head>
            <Table.Body className={classnames(isLoading && 'opacity-50 pointer-events-none select-none')}>
                {isLoading && filteredInvoices.length === 0
                    ? range(10).map((i) => <InvoiceLoadingRow key={i} />)
                    : filteredInvoices.map((invoice: Invoice) => (
                          <ActionableInvoiceRow key={invoice.id} invoice={invoice} />
                      ))}
            </Table.Body>
        </Table>
    );
};

export default React.memo(InvoiceTable);
