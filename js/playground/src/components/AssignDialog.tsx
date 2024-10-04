import { Booking, Invoice } from '../api.ts';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Table } from '@nicoknoll/tables';
import { BooleanField, Form, StringField } from '@nicoknoll/forms';
import { classnames } from '@nicoknoll/utils';
import Button from '../../../packages/forms/src/misc/Button.tsx';
import { FileSymlinkIcon } from 'lucide-react';
import { BookingCell, BookingRow } from './BookingTable.tsx';
import { InvoiceCell, InvoiceRow } from './InvoiceTable.tsx';
import { FORM_DEFAULT_VALUES, getReceiverFromContact, InvoiceDataForm } from './EditInvoiceDialog.tsx';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useData } from '../data.tsx';
import Dialog from './Dialog.tsx';

const toTitleCase = (str: string) => {
    return str.replace(/\w\S*/g, (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase());
};

const filterInvoices = (invoices: Invoice[], searchTerm: string) => {
    return invoices.filter((invoice) => {
        return (
            invoice.receiver.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });
};

const AssignDialog = ({
    booking,
    onCancel,
    onSubmit,
    onCreateInvoiceSubmit,
    isOpen,
    onIsOpenChange,
}: {
    booking: Booking;
    invoices?: Invoice[];
    matches?: any[];
    onCancel: any;
    onSubmit: any;
    onCreateInvoiceSubmit: any;
    isOpen: boolean;
    onIsOpenChange: (isOpen: boolean) => void;
}) => {
    const [{ invoices, matches, settings, contacts }] = useData();
    const nextInvoiceNumber = settings?.nextInvoiceNumber;

    const [assignedInvoiceIds, setAssignedInvoiceIds] = useState(booking.invoices);
    const assignedInvoices = invoices.filter((invoice: Invoice) => assignedInvoiceIds.includes(invoice.id));

    const [filterUnassigned, setFilterUnassigned] = useState(true);
    const filteredInvoices = (
        filterUnassigned ? invoices.filter((invoice: Invoice) => invoice.assignmentStatus !== 'ASSIGNED') : invoices
    ).filter((invoice: Invoice) => !assignedInvoiceIds.includes(invoice.id));

    const [showAllInvoices, setShowAllInvoices] = useState(false);
    const [isCreateInvoice, setIsCreateInvoice] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');

    const suggestedInvoiceIds =
        matches?.filter((match: any) => match.bookingId === booking?.id).map((match: any) => match.invoiceId) || [];
    const suggestedInvoices =
        filteredInvoices?.filter((invoice: Invoice) => suggestedInvoiceIds.includes(invoice.id)) || [];
    const remainingCount = filteredInvoices?.length - suggestedInvoices?.length;

    const displayedInvoices = filterInvoices(
        showAllInvoices || !suggestedInvoices.length ? filteredInvoices : suggestedInvoices,
        searchTerm
    );

    const handleBack = () => {
        setIsCreateInvoice(false);
    };

    const handleCancel = () => {
        setIsCreateInvoice(false);
        onCancel?.();
    };

    const handleIsOpenChange = (isOpen: boolean) => {
        setIsCreateInvoice(false);
        onIsOpenChange?.(isOpen);
    };

    const handleSubmit = () => {
        return Promise.resolve(onSubmit(assignedInvoiceIds))
            .finally(() => {
                setIsLoading(false);
            })
            .catch(() => {
                toast.error('Fehler beim Speichern der Zuordnung');
            });
    };

    /* form stuff */

    const formMethods = useForm({ defaultValues: FORM_DEFAULT_VALUES });

    useEffect(() => {
        const receiverContactId = contacts.find(
            (contact) => contact.name.toLowerCase() === booking?.receiver?.toLowerCase()
        )?.id;

        const receiverContact = contacts.find(
            (contact) => contact.name.toLowerCase() === booking?.receiver?.toLowerCase()
        );
        const receiver = receiverContact ? getReceiverFromContact(receiverContact) : toTitleCase(booking?.receiver);

        const bookingDate = new Date(booking.date);
        const isoDateTime = new Date(bookingDate.getTime() - bookingDate.getTimezoneOffset() * 60000).toISOString();
        formMethods.reset({
            ...FORM_DEFAULT_VALUES,
            total: Math.abs(booking.amount)?.toString(),
            isExpense: booking.amount < 0,
            taxRate: '0',
            date: isoDateTime.split('T')[0],
            invoiceNumber: nextInvoiceNumber,
            receiver: receiver || '',
            receiverContact: receiverContactId || '',
            description: booking.description,
        });
    }, [isCreateInvoice]);

    const [isLoading, setIsLoading] = useState(false);

    const handleFormSubmit = (values: any) => {
        setIsLoading(true);

        return Promise.resolve(onCreateInvoiceSubmit(values))
            .finally(() => {
                setIsLoading(false);
            })
            .then((data) => {
                setAssignedInvoiceIds([...assignedInvoiceIds, data.id]);
                setIsCreateInvoice(false);
            })
            .catch(() => {
                toast.error('Fehler beim Erstellen der Rechnung');
            });
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleIsOpenChange}>
            <Dialog.Content className="w-[80rem]">
                {!isCreateInvoice ? (
                    <>
                        <div className="flex flex-col gap-4">
                            <Dialog.Title className="text-lg font-medium">Rechnung zuweisen</Dialog.Title>

                            <Table className="w-full">
                                <colgroup>
                                    <col />
                                    <col className="w-40" />
                                    <col className="w-40" />
                                    <col className="w-40" />
                                </colgroup>

                                <Table.Body>
                                    <BookingRow
                                        booking={booking}
                                        cellClassName="bg-neutral-50"
                                        additionalCells={<BookingCell className="bg-neutral-50" />}
                                    />
                                </Table.Body>
                            </Table>

                            {assignedInvoices.length > 0 && (
                                <Table className="w-full">
                                    <colgroup>
                                        <col />
                                        <col className="w-40" />
                                        <col className="w-40" />
                                        <col className="w-40" />
                                    </colgroup>

                                    <Table.Body>
                                        {assignedInvoices.map((assignedInvoice) => (
                                            <InvoiceRow
                                                key={assignedInvoice.id}
                                                invoice={assignedInvoice}
                                                additionalCells={
                                                    <>
                                                        <InvoiceCell className={classnames('bg-white text-right')}>
                                                            <Button
                                                                className="inline-flex gap-1 items-center"
                                                                onClick={() => {
                                                                    setAssignedInvoiceIds(
                                                                        assignedInvoiceIds.filter(
                                                                            (id) => id !== assignedInvoice.id
                                                                        )
                                                                    );
                                                                }}
                                                            >
                                                                <FileSymlinkIcon />
                                                                Entfernen
                                                            </Button>
                                                        </InvoiceCell>
                                                    </>
                                                }
                                                cellClassName="bg-white"
                                            />
                                        ))}
                                    </Table.Body>
                                </Table>
                            )}
                        </div>

                        <div className="flex flex-col gap-4 flex-1 min-h-0">
                            <div className="flex justify-between items-center gap-4">
                                <h3 className="text-base font-medium">Rechnungen</h3>

                                <BooleanField
                                    label="Nur unzugeordnete anzeigen"
                                    checked={filterUnassigned}
                                    onChange={() => setFilterUnassigned(!filterUnassigned)}
                                    className="ml-auto"
                                />

                                <StringField
                                    placeholder="Suchbegriff..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="bg-neutral-100 rounded-xl p-4 flex flex-1 min-h-0 flex-col gap-4 max-h-[600px] overflow-auto border border-neutral-100">
                                {displayedInvoices?.map((invoice) => {
                                    const additionalCells = (
                                        <>
                                            <Table.Cell className={classnames('text-right')}>
                                                <Button
                                                    className="inline-flex gap-1 items-center"
                                                    onClick={() => {
                                                        setAssignedInvoiceIds([...assignedInvoiceIds, invoice.id]);
                                                    }}
                                                >
                                                    <FileSymlinkIcon />
                                                    Auswählen
                                                </Button>
                                            </Table.Cell>
                                        </>
                                    );
                                    return (
                                        <Table className="w-full" key={invoice.id}>
                                            <colgroup>
                                                <col />
                                                <col className="w-40" />
                                                <col className="w-40" />
                                                <col className="w-40" />
                                            </colgroup>

                                            <Table.Body>
                                                <InvoiceRow
                                                    invoice={invoice}
                                                    additionalCells={additionalCells}
                                                    cellClassName="bg-white"
                                                />
                                            </Table.Body>
                                        </Table>
                                    );
                                })}

                                {!(showAllInvoices || !suggestedInvoices.length) && (
                                    <div className="text-sm text-center text-neutral-500 flex flex-col items-center gap-2">
                                        <div className="py-2">{remainingCount} ausgeblendet</div>
                                        <Button
                                            className="inline-flex gap-1 items-center"
                                            onClick={() => setShowAllInvoices(true)}
                                        >
                                            Alle anzeigen
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between gap-2">
                            <Button onClick={handleCancel}>Abbrechen</Button>

                            <div className="flex gap-2 justify-end">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsCreateInvoice(true)}
                                    className="flex items-center gap-1"
                                >
                                    Neue Rechnung anlegen
                                </Button>

                                <Button
                                    className="inline-flex items-center gap-1.5 !bg-black !text-white !border-black hover:!bg-neutral-800 shadow-none px-2.5 disabled:opacity-50"
                                    onClick={handleSubmit}
                                >
                                    Speichern
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col gap-6">
                        <h1 className="text-lg font-medium">Rechnung / Beleg erstellen</h1>

                        <Form formMethods={formMethods} onSubmit={handleFormSubmit} className="flex flex-col gap-8">
                            <InvoiceDataForm formMethods={formMethods} contacts={contacts} isLoading={isLoading} />

                            <div className="flex gap-2 justify-between">
                                <Button type="button" onClick={handleCancel}>
                                    Abbrechen
                                </Button>

                                <div className="flex gap-2 justify-end">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={handleBack}
                                        className="flex items-center gap-1"
                                    >
                                        Zurück
                                    </Button>

                                    <Button
                                        type="submit"
                                        className="inline-flex items-center gap-1.5 !bg-black !text-white !border-black hover:!bg-neutral-800 shadow-none px-2.5 disabled:opacity-50"
                                        loading={isLoading}
                                        disabled={isLoading}
                                    >
                                        Rechnung erstellen
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </div>
                )}
            </Dialog.Content>
        </Dialog>
    );
};

export default AssignDialog;
