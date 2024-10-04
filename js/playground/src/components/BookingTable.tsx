import * as React from 'react';
import { useMemo, useState } from 'react';
import api, { Booking } from '../api.ts';
import { classnames, formatDate } from '@nicoknoll/utils';
import { Table } from '@nicoknoll/tables';
import { FileSymlinkIcon, MinusIcon, PlusIcon } from 'lucide-react';
import Button from '../../../packages/forms/src/misc/Button.tsx';
import MoneyBadge from './MoneyBadge.tsx';
import AssignDialog from './AssignDialog.tsx';
import { Checkbox } from '@nicoknoll/forms';
import MoreMenu from './MoreMenu.tsx';
import { useConfirmationDialogContext } from './ConfirmationDialog.tsx';
import { useData } from '../data.tsx';
import toast from 'react-hot-toast';
import EditBookingDialog from './EditBookingDialog.tsx';
import Skeleton from './Skeleton.tsx';
import { range } from 'lodash';

const BookingContext = React.createContext<Booking | null>(null);
const useBookingContext = () => React.useContext(BookingContext);

export const BookingCell = ({ className, ...props }: { className?: string; [key: string]: any }) => {
    const booking = useBookingContext()!;
    return (
        <Table.Cell className={classnames(booking.amount > 0 ? 'bg-green-50' : 'bg-red-50', className)} {...props} />
    );
};

const Badge = ({ children, className, ...props }: { children: any; className?: string; [key: string]: any }) => {
    return (
        <span
            className={classnames(
                'block px-2 py-0.5 rounded-full text-xs bg-black/5 text-neutral-700 truncate',
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};

export const BookingRow = ({
    booking,
    cellClassName,
    additionalCells,
    ...props
}: {
    booking: Booking;
    cellClassName?: string;
    additionalCells?: any;
    [key: string]: any;
}) => {
    const [{ costCenters, bankAccounts }, { refetch }] = useData();

    const costCenter = costCenters.find((costCenter) => costCenter.id === booking.costCenter);
    const bankAccount = bankAccounts.find((bankAccount) => bankAccount.id === booking.bankAccount);

    return (
        <BookingContext.Provider value={booking}>
            <Table.Row {...props}>
                <BookingCell className={cellClassName}>
                    <div className="flex gap-4 items-center py-1">
                        <div className={classnames(booking.amount > 0 ? 'text-green-700' : 'text-red-700')}>
                            {booking.amount > 0 ? <PlusIcon /> : <MinusIcon />}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <div className="font-medium">{booking.receiver || ''}</div>
                            <div className="text-neutral-500 flex gap-2 items-center">
                                {booking.description || ''}
                                {booking.costCenter && costCenter && (
                                    <Badge>
                                        [{costCenter.number}] {costCenter.name}
                                    </Badge>
                                )}
                                {booking.bankAccount && bankAccount && <Badge>{bankAccount.name}</Badge>}
                            </div>
                        </div>
                    </div>
                </BookingCell>
                <BookingCell className={cellClassName}>{booking.date && formatDate(booking.date)}</BookingCell>
                <BookingCell className={classnames(cellClassName, 'text-right')}>
                    <MoneyBadge amount={booking.amount} />
                </BookingCell>
                {additionalCells}
            </Table.Row>
        </BookingContext.Provider>
    );
};

export const useBookingAssignAction = ({ booking }: { booking: Booking }) => {
    const [isOpen, setIsOpen] = useState(false);

    const [, { refetch }] = useData();

    const handleClick = () => {
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleSubmit = async (invoiceIds: string[]) => {
        const data = await api.bookings.putAssignments(booking.id, invoiceIds);
        toast.success('Buchung erfolgreich gespeichert');
        await refetch();
        setIsOpen(false);
        return data;
    };

    const handleCreateInvoiceSubmit = async (invoiceData: any) => {
        const data = await api.invoices.create(invoiceData);
        toast.success('Rechnung erfolgreich erstellt');
        await refetch();
        return data;
    };

    const renderDialog = () => {
        if (!isOpen) return null;

        return (
            <AssignDialog
                isOpen={isOpen}
                onIsOpenChange={setIsOpen}
                booking={booking}
                matches={[]}
                invoices={[]}
                onSubmit={handleSubmit}
                onCancel={handleClose}
                onCreateInvoiceSubmit={handleCreateInvoiceSubmit}
            />
        );
    };

    return {
        onClick: handleClick,
        renderDialog,
    };
};

export const useBookingRemoveAllAssignmentsAction = ({ booking }: { booking: Booking }) => {
    const confirm = useConfirmationDialogContext();

    const [, { refetch }] = useData();

    const handleRemove = async () => {
        const data = await api.bookings.putAssignments(booking.id, []);
        toast.success('Buchung erfolgreich grspeichert');
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

export const useBookingEditAction = ({ booking }: { booking: Booking }) => {
    const [isOpen, setIsOpen] = useState(false);

    const [, { refetch }] = useData();

    const handleClick = () => {
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleSubmit = async (values: any) => {
        const data = await api.bookings.update(booking.id, values);
        toast.success('Buchung erfolgreich gespeichert');
        await refetch();
        return data;
    };

    const getBookingData = (booking: Booking) => {
        return {
            ...booking,
            amount: booking?.amount?.toString() || '',
        };
    };

    const bookingData = useMemo(() => getBookingData(booking), [booking]);
    const renderDialog = () => {
        if (!isOpen) return null;

        return (
            <EditBookingDialog
                isOpen={isOpen}
                onIsOpenChange={setIsOpen}
                bookingData={bookingData}
                onSubmit={handleSubmit}
                onCancel={handleClose}
            />
        );
    };

    return {
        onClick: handleClick,
        renderDialog,
    };
};

export const useBookingDeleteAction = ({ booking }: { booking: Booking }) => {
    const confirm = useConfirmationDialogContext();

    const [, { refetch }] = useData();

    const handleDelete = async () => {
        await api.bookings.delete(booking.id);
        toast.success('Buchung erfolgreich gelöscht');
        await refetch();
    };

    const handleClick = () => {
        return confirm(
            'Möchtest du die Buchung wirklich löschen?',
            <Table className="w-full">
                <colgroup>
                    <col />
                    <col className="w-52" />
                    <col className="w-32" />
                </colgroup>

                <Table.Body>
                    <BookingRow booking={booking} />
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

export const AssignableBookingRow = ({ booking, cellClassName, additionalCells, moreMenu, ...props }: any) => {
    const assignAction = useBookingAssignAction({ booking });

    return (
        <>
            <BookingRow
                booking={booking}
                cellClassName={cellClassName}
                additionalCells={
                    <>
                        <BookingCell className={classnames(cellClassName, 'text-right')}>
                            <div className="flex gap-2 justify-end">
                                <Button className="inline-flex gap-1 items-center" onClick={assignAction.onClick}>
                                    <FileSymlinkIcon />
                                    Rechnung zuweisen
                                </Button>

                                {moreMenu}
                            </div>
                        </BookingCell>

                        {additionalCells}
                    </>
                }
                {...props}
            />

            {assignAction.renderDialog()}
        </>
    );
};

const BookingLoadingRow = () => (
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

const BookingTableMoreMenu = ({ booking, ...props }: { booking: Booking; [key: string]: any }) => {
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

const BookingTable = ({ bookings, isLoading }: { bookings: Booking[]; isLoading?: boolean }) => {
    const [filterUnassigned, setFilterUnassigned] = useState(true);

    const filteredBookings = filterUnassigned
        ? bookings.filter((booking: Booking) => booking.assignmentStatus !== 'ASSIGNED')
        : bookings;

    return (
        <Table className="w-full">
            <Table.Head>
                <Table.Row>
                    <Table.HeadCell className="bg-neutral-900 border-neutral-900 text-white font-medium">
                        Buchung
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
                {isLoading && bookings.length === 0
                    ? range(10).map((i) => <BookingLoadingRow key={i} />)
                    : filteredBookings.map((booking: Booking) => (
                          <AssignableBookingRow
                              key={booking.id}
                              booking={booking}
                              cellClassName="bg-white"
                              moreMenu={<BookingTableMoreMenu booking={booking} />}
                          />
                      ))}
            </Table.Body>
        </Table>
    );
};

export default React.memo(BookingTable);
