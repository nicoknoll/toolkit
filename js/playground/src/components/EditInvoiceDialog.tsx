import * as React from 'react';
import { useEffect, useState } from 'react';
import {
    DateField,
    DecimalField,
    Field,
    FileInput,
    Form,
    SelectField,
    StringField,
    TextField,
    ToggleButton,
    Widget,
} from '@nicoknoll/forms';
import Button from '../../../packages/forms/src/misc/Button.tsx';
import { useForm } from 'react-hook-form';
import { LoaderIcon, TriangleAlertIcon } from 'lucide-react';
import { formatMoney } from '@nicoknoll/utils';
import toast from 'react-hot-toast';
import Dialog from './Dialog.tsx';
import { useData } from '../data.tsx';
import api, { Contact } from '../api.ts';

export interface InvoiceData {
    total?: string;
    isExpense?: boolean;
    taxRate?: string;
    date?: string;
    invoiceNumber?: string;
    receiver?: string;
    receiverContact?: string;
    description?: string;
}

const TAX_RATE_OPTIONS = [
    { value: '0', label: '0%' },
    { value: '7', label: '7%' },
    { value: '19', label: '19%' },
];

export const FORM_DEFAULT_VALUES = {
    total: '',
    isExpense: true, // I receive money = false, I pay money = true
    taxRate: '',
    date: '',
    invoiceNumber: '',
    receiver: '',
    receiverContact: '',
    description: '',
    file: null,
};

const getFormValuesFromFile = async (invoiceFile: File): Promise<InvoiceData> => {
    try {
        const data = await api.invoices.analyzeFile(invoiceFile);
        return {
            invoiceNumber: data.invoiceNumber,
            description: data.description,
            date: data.date,
            receiver: data.receiver,
            total: data.total.toString(),
            taxRate: data.taxRate.toString(),
        };
    } catch (e) {
        return {};
    }
};

export const getReceiverFromContact = (contact: Contact) => {
    return contact.address
        ? `${contact.name}\n${contact.address
              .split(',')
              .map((l) => l.trim())
              .join('\n')}`
        : contact.name;
};

const isImageUrl = (url: string) => {
    const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i;
    const imageDataUrlPattern = /^data:image\/(jpg|jpeg|png|gif|bmp|webp|svg)\+?/i;

    if (url.startsWith('data:')) {
        return imageDataUrlPattern.test(url);
    } else if (imageExtensions.test(url)) {
        return true;
    }

    return false;
};

const isPdfUrl = (url: string) => {
    const pdfExtensions = /\.(pdf)$/i;
    const pdfDataUrlPattern = /^data:application\/pdf\+?/i;

    if (url.startsWith('data:')) {
        return pdfDataUrlPattern.test(url);
    } else if (pdfExtensions.test(url)) {
        return true;
    }
};

const FilePreview = ({ url }: { url: string }) => {
    if (isImageUrl(url)) {
        return (
            <a href={url} className="block flex-1" target="_blank">
                <img src={url} alt="Invoice" className="w-full h-auto object-cover bg-neutral-100 text-transparent" />
            </a>
        );
    } else if (isPdfUrl(url)) {
        return (
            <object
                data={url}
                type="application/pdf"
                className="w-full h-full aspect-[1/1.414]"
                aria-label="PDF Vorschau"
            >
                <embed src={url} type="application/pdf" />
            </object>
        );
    } else {
        return (
            <div className="flex items-center justify-center w-full h-full text-neutral-500">
                <div className="text-center">
                    <div>Datei kann nicht angezeigt werden</div>
                </div>
            </div>
        );
    }
};

export const InvoiceDataForm = ({
    formMethods,
    contacts = [],
    isLoading = false,
    isDisabled = false,
}: {
    formMethods: any;
    contacts?: Contact[];
    isLoading?: boolean;
    isDisabled?: boolean;
}) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleFileChange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();

            reader.onloadend = async () => {
                file.url = reader.result as string;
                formMethods.setValue('file', file);
            };

            reader.readAsDataURL(file);
        } else {
            formMethods.setValue('file', null);
        }
    };

    const total = parseFloat(formMethods.watch('total'));
    const taxRate = parseFloat(formMethods.watch('taxRate'));
    const netAmount = Math.round((total / (1 + taxRate / 100)) * 100) / 100 || undefined;
    const taxAmount = netAmount ? total - netAmount : undefined;

    const handleAnalyzeFile = async () => {
        setIsAnalyzing(true);

        const values = formMethods.getValues();

        try {
            const data = await getFormValuesFromFile(values?.file);

            const receiverContact = contacts.find(
                (contact) =>
                    contact.name.toLowerCase() === data?.receiver?.toLowerCase() || contact.id === data?.receiverContact
            );
            const receiver = receiverContact ? getReceiverFromContact(receiverContact) : data?.receiver;

            formMethods.reset({
                ...FORM_DEFAULT_VALUES,
                ...data,
                file: values.file,
                receiver: receiver || '',
                receiverContact: data?.receiverContact ? data?.receiverContact : receiverContact?.id || '',
                invoiceNumber: data?.invoiceNumber || '',
                total: data?.total?.toString() || '',
                taxRate: data?.taxRate?.toString() || '',
            });
        } catch (e) {
            toast.error('Fehler beim Analysieren der Datei');
            console.error(e);
        }

        setIsAnalyzing(false);
    };

    const handleReceiverContactChange = (e: any) => {
        const contact = contacts.find((contact) => contact.id === e.target.value);
        if (contact) {
            formMethods.setValue('receiver', getReceiverFromContact(contact));
        } else {
            formMethods.setValue('receiver', '');
        }
    };

    const file = formMethods.watch('file');
    const fileUrl = file?.url;
    const isBase64 = fileUrl?.startsWith('data:');

    const isExpense = formMethods.watch('isExpense') === true;
    const receiverContact = formMethods.watch('receiverContact');

    const isFieldDisabled = isLoading || isDisabled || isAnalyzing;

    const contactOptions = contacts.map((contact) => ({
        value: contact.id,
        label: (
            <span>
                {contact.name}
                <br />
                <span className="text-xs text-neutral-500">{contact.address}</span>
            </span>
        ),
    }));

    return (
        <div className="flex gap-8 items-start">
            <div className="flex-1 flex flex-col gap-4 min-w-0">
                {fileUrl && (
                    <Widget className="flex-1 relative hover:border-neutral-300 shadow-sm active:border-neutral-300 rounded-lg overflow-hidden">
                        {isAnalyzing && (
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                <div className="flex gap-2 font-medium text-neutral-500 rounded-lg bg-white/50 backdrop-blur px-4 py-3 w-full h-full text-center items-center justify-center">
                                    <LoaderIcon className="animate-spin-slow" />
                                    Analysieren...
                                </div>
                            </div>
                        )}

                        <FilePreview url={fileUrl} />
                    </Widget>
                )}

                <FileInput
                    multiple={false}
                    className="flex-1"
                    required
                    placeholder="Datei auswählen oder hierher ziehen"
                    value={file}
                    onChange={handleFileChange}
                    disabled={isFieldDisabled}
                />
            </div>

            <div className="flex flex-col flex-1 gap-5 w-full border-b border-neutral-200 border-solid last:border-none">
                <SelectField
                    options={[
                        { value: 'true', label: 'Ausgabe' },
                        { value: 'false', label: 'Einnahme' },
                    ]}
                    name="isExpense"
                    value={isExpense ? 'true' : 'false'}
                    onChange={(e) => formMethods.setValue('isExpense', e.target.value === 'true')}
                    widget={ToggleButton}
                    disabled={isFieldDisabled}
                    className="mb-2"
                />

                {fileUrl && isBase64 && (
                    <div className="rounded-xl bg-neutral-100 p-4 flex flex-col gap-4 mb-2">
                        <Button type="button" onClick={() => handleAnalyzeFile()} disabled={isFieldDisabled}>
                            Datei analysieren und Felder automatisch ausfüllen
                        </Button>
                    </div>
                )}

                <div className="flex gap-5">
                    <Form.Field name="invoiceNumber">
                        <StringField
                            label="Rechnungsnummer"
                            required
                            className="flex-1 min-w-0"
                            disabled={isFieldDisabled}
                        />
                    </Form.Field>

                    <Form.Field name="date">
                        <DateField
                            label="Rechnungsdatum"
                            required
                            className="flex-1 min-w-0"
                            disabled={isFieldDisabled}
                        />
                    </Form.Field>
                </div>

                <div className="flex flex-col gap-1">
                    <Field.Label required>{isExpense ? 'Absender / Rechnungssteller' : 'Empfänger'}</Field.Label>

                    <div className="flex flex-col gap-2">
                        {contactOptions.length > 0 && (
                            <Form.Field name="receiverContact">
                                <SelectField
                                    placeholder="Verknüpfter Kontakt"
                                    disabled={isFieldDisabled}
                                    options={contactOptions}
                                    onChange={handleReceiverContactChange}
                                />
                            </Form.Field>
                        )}

                        {!receiverContact && (
                            <Form.Field name="receiver">
                                <TextField required disabled={isFieldDisabled} placeholder="Name / Anschrift *" />
                            </Form.Field>
                        )}
                    </div>
                </div>

                <Form.Field name="description">
                    <StringField label="Beschreibung" required disabled={isFieldDisabled} />
                </Form.Field>

                <div className="flex gap-5">
                    <Form.Field name="total">
                        <DecimalField
                            label="Gesamtbetrag (brutto)"
                            required
                            placeholder="0.00"
                            controls={<span className="w-8 text-center text-sm text-neutral-400">€</span>}
                            className="flex-1 min-w-0"
                            helpText={`Nettobetrag: ${netAmount !== undefined ? formatMoney(netAmount) : ''}`}
                            disabled={isFieldDisabled}
                        />
                    </Form.Field>

                    <Form.Field name="taxRate">
                        <SelectField
                            label="Steuersatz"
                            required
                            options={TAX_RATE_OPTIONS}
                            className="flex-1 min-w-0"
                            helpText={`Steuerbetrag: ${taxAmount !== undefined ? formatMoney(taxAmount) : ''}`}
                            hideSearch
                            disabled={isFieldDisabled}
                        />
                    </Form.Field>
                </div>
            </div>
        </div>
    );
};

const EditInvoiceDialog = ({
    isCreate = false,
    isFormDisabled = false,
    invoiceData,
    isOpen,
    onIsOpenChange,
    onSubmit,
    onCancel,
}: {
    isCreate?: boolean;
    isFormDisabled?: boolean;
    invoiceData?: InvoiceData;
    isOpen: boolean;
    onIsOpenChange: (isOpen: boolean) => void;
    onSubmit: (data: InvoiceData) => any;
    onCancel: any;
}) => {
    const formMethods = useForm({ defaultValues: FORM_DEFAULT_VALUES });

    const [{ settings, contacts }] = useData();
    const nextInvoiceNumber = settings?.nextInvoiceNumber;

    const resetFormToInvoiceData = () => {
        const receiverContact = contacts.find(
            (contact) =>
                contact.name.toLowerCase() === invoiceData?.receiver?.toLowerCase() ||
                contact.id === invoiceData?.receiverContact
        );
        const receiver = receiverContact ? getReceiverFromContact(receiverContact) : invoiceData?.receiver;
        return formMethods.reset({
            ...FORM_DEFAULT_VALUES,
            ...invoiceData,
            receiver: receiver || '',
            receiverContact: invoiceData?.receiverContact ? invoiceData?.receiverContact : receiverContact?.id || '',
            invoiceNumber: invoiceData?.invoiceNumber || nextInvoiceNumber || '',
            total: invoiceData?.total?.toString() || '',
            taxRate: invoiceData?.taxRate?.toString() || '',
        });
    };

    useEffect(resetFormToInvoiceData, [invoiceData]);

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (values: any) => {
        setIsLoading(true);

        try {
            await Promise.resolve(onSubmit(values));
        } catch (error) {
            toast.error(isCreate ? 'Fehler beim Erstellen der Rechnung' : 'Fehler beim Speichern der Rechnung');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onIsOpenChange}>
            <Dialog.Content>
                <div className="flex flex-col gap-6">
                    <Dialog.Title asChild>
                        <h1 className="text-lg font-medium">
                            {isCreate ? 'Rechnung / Beleg erstellen' : 'Rechnung / Beleg bearbeiten'}
                        </h1>
                    </Dialog.Title>

                    {isFormDisabled && (
                        <div className="bg-yellow-50 rounded-lg p-4 text-sm text-yellow-800 flex gap-2 items-center">
                            <TriangleAlertIcon className="inline flex-none" />
                            <p>
                                <strong className="font-medium">Rechnungen / Belege</strong> können nur bearbeitet
                                werden, solange sie als <strong className="font-medium">Entwurf</strong> gekennzeichnet
                                sind.
                            </p>
                        </div>
                    )}

                    <Form formMethods={formMethods} onSubmit={handleSubmit} className="flex flex-col gap-8">
                        <InvoiceDataForm
                            formMethods={formMethods}
                            contacts={contacts}
                            isLoading={isLoading}
                            isDisabled={isFormDisabled}
                        />

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

export default React.memo(EditInvoiceDialog);
