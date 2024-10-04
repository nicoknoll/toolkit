import * as React from 'react';
import api from '../api.ts';
import ClusterTable from '../components/ClusterTable.tsx';
import InvoiceTable from '../components/InvoiceTable.tsx';
import BookingTable from '../components/BookingTable.tsx';
import { BatchTransferDrawerProvider } from '../components/BatchTransferDrawer.tsx';
import { DataProvider, useData, useFetchedData } from '../data.tsx';
import EditInvoiceDialog from '../components/EditInvoiceDialog.tsx';
import Button from '../../../packages/forms/src/misc/Button.tsx';
import toast from 'react-hot-toast';
import { ConfirmationDialogProvider } from '../components/ConfirmationDialog.tsx';
import EditBookingDialog from '../components/EditBookingDialog.tsx';
import useSearchParamState from '../utils/useSearchParamState.tsx';
import { Page } from '@nicoknoll/utils';

const CreateInvoiceButton = (props: any) => {
    const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useSearchParamState<boolean>('create-invoice', false, {
        parseBoolean: true,
    });

    const [_, { refetch }] = useData();

    const handleSubmit = async (values: any) => {
        const data = await api.invoices.create(values);
        toast.success('Rechnung erfolgreich erstellt');
        await refetch();
        setIsCreateInvoiceOpen(false);
        return data;
    };

    return (
        <>
            {isCreateInvoiceOpen && (
                <EditInvoiceDialog
                    isCreate
                    isOpen={isCreateInvoiceOpen}
                    onIsOpenChange={setIsCreateInvoiceOpen}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsCreateInvoiceOpen(false)}
                    invoiceData={{
                        date: new Date().toISOString().split('T')[0],
                        taxRate: '0',
                    }}
                />
            )}

            <Button {...props} onClick={() => setIsCreateInvoiceOpen(true)}>
                Rechnung erstellen
            </Button>
        </>
    );
};

const CreateBookingButton = (props: any) => {
    const [isCreateBookingOpen, setIsCreateBookingOpen] = useSearchParamState<boolean>('create-booking', false, {
        parseBoolean: true,
    });

    const [_, { refetch }] = useData();

    const handleSubmit = async (values: any) => {
        const data = await api.bookings.create(values);
        toast.success('Buchung erfolgreich erstellt');
        await refetch();
        return data;
    };

    return (
        <>
            {isCreateBookingOpen && (
                <EditBookingDialog
                    isCreate
                    isOpen={isCreateBookingOpen}
                    onIsOpenChange={setIsCreateBookingOpen}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsCreateBookingOpen(false)}
                    bookingData={{
                        date: new Date().toISOString(),
                    }}
                />
            )}

            <Button {...props} onClick={() => setIsCreateBookingOpen(true)}>
                Buchung erstellen
            </Button>
        </>
    );
};

const TestTable = () => {
    const [data, { refetch, isLoading }] = useFetchedData();

    return (
        <DataProvider data={data} refetch={refetch}>
            <BatchTransferDrawerProvider>
                <ConfirmationDialogProvider>
                    <Page title="Test Table">
                        <div className="w-full flex flex-col gap-12">
                            <div className="w-full flex flex-col gap-4">
                                <ClusterTable clusters={data?.clusters} isLoading={isLoading} />

                                <div className="text-sm text-neutral-500 text-center">
                                    {isLoading ? (
                                        <span>Cluster werden geladen...</span>
                                    ) : (
                                        <span>{data?.clusters.length} Cluster gefunden</span>
                                    )}
                                </div>
                            </div>

                            <div className="w-full flex flex-col gap-5 items-start">
                                <BookingTable bookings={data?.bookings} isLoading={isLoading} />

                                <div className="text-sm text-neutral-500 text-center w-full flex flex-col gap-4 items-center">
                                    {isLoading ? (
                                        <span>Buchungen werden geladen...</span>
                                    ) : (
                                        <span>{data?.bookings.length} Buchungen gefunden</span>
                                    )}
                                    <CreateBookingButton disabled={isLoading} />
                                </div>
                            </div>

                            <div className="w-full flex flex-col gap-6 items-start">
                                <InvoiceTable invoices={data?.invoices} isLoading={isLoading} />

                                <div className="w-full flex flex-col gap-4 items-center text-sm text-neutral-500 text-center">
                                    {isLoading ? (
                                        <span>Rechnungen werden geladen...</span>
                                    ) : (
                                        <span>{data?.invoices.length} Rechnungen gefunden</span>
                                    )}
                                    <CreateInvoiceButton disabled={isLoading} />
                                </div>
                            </div>
                        </div>
                    </Page>
                </ConfirmationDialogProvider>
            </BatchTransferDrawerProvider>
        </DataProvider>
    );
};

export default TestTable;
