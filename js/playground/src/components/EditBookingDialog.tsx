import * as React from 'react';
import { useEffect, useState } from 'react';
import { DecimalField, Form, SelectField, StringField } from '@nicoknoll/forms';
import DateTimeField from '@nicoknoll/forms/src/fields/DateTimeField.tsx';
import Button from '../../../packages/forms/src/misc/Button.tsx';
import { useForm } from 'react-hook-form';
import { formatDateShort } from '@nicoknoll/utils';
import toast from 'react-hot-toast';
import Dialog from './Dialog.tsx';
import { useData } from '../data.tsx';

export interface BookingData {
    amount?: string;
    description?: string;
    date?: string;
    receiver?: string;
    senderIban?: string;
    senderBic?: string;

    bookingReference?: string;
    bankAccount?: string;
    costCenter?: string;
}

interface Option {
    value: string;
    label?: React.ReactNode;
}

export const FORM_DEFAULT_VALUES = {
    amount: '',
    description: '',
    date: '',
    receiver: '',
    senderIban: '',
    senderBic: '',

    bookingReference: '',
    bankAccount: '',
    costCenter: '',
};

// SKR 49
const COST_CENTER_GROUP_MAP: Record<string, string> = {
    '0': 'Bestandskonten Aktiva (0000-0999)',
    '1': 'Bestandskonten Passiva (1000-1999)',
    '2': 'Erfolgskonten für Ideellen Bereich (2000-2999)',
    '3': 'Erfolgskonten für ertragssteuerneutrale Posten (3000-3999)',
    '4': 'Erfolgskonten für Vermögensverwaltung (4000-4999)',
    '5': 'Erfolgskonten für ertragsteuerfreie Zweckbetriebe Sport (5000-5999)',
    '6': 'Erfolgskonten für andere ertragsteuerfreie Zweckbetriebe (6000-6999)',
    '7': 'Erfolgskonten für ertragsteuerpflichtige Geschäftsbetriebe Sport (7000-7999)',
    '8': 'Erfolgskonten für andere ertragsteuerpflichtige Geschäftsbetriebe (8000-8999)',
    '9': 'Statistikkonten (9000-9999)',
};

const getCostCenterOptionGroups = (costCenters: any): [string, Option[]][] => {
    // group by first digit
    return Object.values(
        costCenters.reduce((acc: any, center: any) => {
            const group = center.number[0];
            if (!acc[group]) {
                acc[group] = [COST_CENTER_GROUP_MAP[group] || group, []];
            }
            acc[group][1].push({
                label: `${center.number} ${center.name}`,
                value: center.id,
            });
            return acc;
        }, {})
    );
};

export const BookingDataForm = ({
    formMethods,
    isLoading = false,
    isDisabled = false,
}: {
    formMethods: any;
    isLoading?: boolean;
    isDisabled?: boolean;
}) => {
    const isFieldDisabled = isLoading || isDisabled;

    const [{ bankAccounts, costCenters }] = useData();

    const bankAccountOptions = bankAccounts.map((account) => ({
        label: account.name,
        value: account.id,
    }));

    const costCenterOptionGroups = getCostCenterOptionGroups(costCenters);

    return (
        <div className="flex flex-col flex-1 gap-5 w-full">
            <div className="flex gap-5">
                <Form.Field name="bookingReference">
                    <StringField
                        label="Buchungsreferenz"
                        className="flex-[1.5] min-w-0"
                        disabled={isFieldDisabled}
                        helpText="Wird beim Online-Banking automatisch generiert"
                    />
                </Form.Field>

                <Form.Field name="date">
                    <DateTimeField
                        label="Buchungsdatum"
                        required
                        className="flex-1 min-w-0"
                        disabled={isFieldDisabled}
                        placeholder={formatDateShort(new Date())}
                    />
                </Form.Field>
            </div>

            <div className="flex gap-5">
                <Form.Field name="description">
                    <StringField
                        label="Beschreibung / Verwendungszweck"
                        className="flex-[2.5] min-w-0"
                        required
                        disabled={isFieldDisabled}
                    />
                </Form.Field>

                <Form.Field name="amount">
                    <DecimalField
                        label="Betrag"
                        required
                        placeholder="0,00"
                        controls={<span className="w-8 text-center text-sm text-neutral-400">€</span>}
                        className="flex-1 min-w-0"
                        disabled={isFieldDisabled}
                    />
                </Form.Field>
            </div>

            <div className="border-b w-full border-neutral-200" />

            <Form.Field name="receiver">
                <StringField label="Geschäftspartner" required disabled={isFieldDisabled} />
            </Form.Field>

            <div className="flex gap-5">
                <Form.Field name="senderIban">
                    <StringField
                        label="Geschäftspartner IBAN"
                        placeholder="DE12345678901234567890"
                        className="flex-[1.5] min-w-0"
                        disabled={isFieldDisabled}
                    />
                </Form.Field>

                <Form.Field name="senderBic">
                    <StringField
                        label="Geschäftspartner BIC"
                        placeholder="ABCDEF12XXX"
                        className="flex-1 min-w-0"
                        disabled={isFieldDisabled}
                    />
                </Form.Field>
            </div>

            <div className="border-b w-full border-neutral-200" />

            <Form.Field name="bankAccount">
                <SelectField
                    label="Bankkonto"
                    className="flex-[1.5] min-w-0"
                    disabled={isFieldDisabled}
                    options={bankAccountOptions}
                />
            </Form.Field>

            <Form.Field name="costCenter">
                <SelectField
                    label="Kostenstelle"
                    className="flex-[1.5] min-w-0"
                    disabled={isFieldDisabled}
                    options={costCenterOptionGroups}
                />
            </Form.Field>
        </div>
    );
};

const EditBookingDialog = ({
    isCreate = false,
    isFormDisabled = false,
    bookingData,
    isOpen,
    onIsOpenChange,
    onSubmit,
    onCancel,
}: {
    isCreate?: boolean;
    isFormDisabled?: boolean;
    bookingData?: BookingData;
    isOpen: boolean;
    onIsOpenChange: (isOpen: boolean) => void;
    onSubmit: (data: BookingData) => any;
    onCancel: any;
}) => {
    const formMethods = useForm({ defaultValues: FORM_DEFAULT_VALUES });

    const resetFormToBookingData = () =>
        formMethods.reset({
            ...FORM_DEFAULT_VALUES,
            ...bookingData,
            amount: bookingData?.amount?.toString() || '',
        });

    useEffect(() => {
        resetFormToBookingData();
    }, [bookingData]);

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (values: any) => {
        setIsLoading(true);

        try {
            await Promise.resolve(onSubmit(values));
            onIsOpenChange(false);
        } catch {
            toast.error(isCreate ? 'Fehler beim Erstellen der Buchung' : 'Fehler beim Speichern der Buchung');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onIsOpenChange}>
            <Dialog.Content className="w-[40rem]">
                <div className="flex flex-col gap-6">
                    <Dialog.Title asChild>
                        <h1 className="text-lg font-medium">{isCreate ? 'Buchung erstellen' : 'Buchung bearbeiten'}</h1>
                    </Dialog.Title>

                    <Form formMethods={formMethods} onSubmit={handleSubmit} className="flex flex-col gap-8">
                        <BookingDataForm formMethods={formMethods} isLoading={isLoading} isDisabled={isFormDisabled} />

                        <div className="flex gap-2 justify-between">
                            <Button type="button" onClick={onCancel}>
                                Abbrechen
                            </Button>
                            <div className="flex gap-2 justify-end">
                                <Button
                                    type="submit"
                                    className="inline-flex items-center gap-1.5 !bg-black !text-white !border-black hover:!bg-neutral-800 shadow-none px-2.5 disabled:opacity-50"
                                    loading={isLoading}
                                    disabled={isLoading || isFormDisabled}
                                >
                                    {isCreate ? 'Erstellen' : 'Speichern'}
                                </Button>
                            </div>
                        </div>
                    </Form>
                </div>
            </Dialog.Content>
        </Dialog>
    );
};

export default React.memo(EditBookingDialog);
