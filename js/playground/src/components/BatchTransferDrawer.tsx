import * as React from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    ArrowLeftIcon,
    BookmarkIcon,
    CheckCircle2Icon,
    DownloadIcon,
    Edit2Icon,
    MinusIcon,
    SparklesIcon,
    TrashIcon,
} from 'lucide-react';
import { DecimalField, Form, StringField, TextInput } from '@nicoknoll/forms';
import { useControllableState, useLocalStorage } from '@nicoknoll/utils';

import api, { BatchTransferItem, Booking, Invoice } from '../api.ts';
import Button from '../../../packages/forms/src/misc/Button.tsx';
import MoneyBadge from './MoneyBadge.tsx';
import { useWidgetState } from '../../../packages/forms/src/widgets/Widget.tsx';
import { camelCase } from 'lodash';
import toast from 'react-hot-toast';

const BATCH_TRANSFER_KEY = 'batch-transfer';

const removeLineBreaks = (str: string) => str.replace(/(\r\n|\n|\r)/gm, ' ');

const validateIban = (iban: string) => {
    iban = iban.replace(/\s/g, '').toUpperCase();
    try {
        return (
            BigInt(
                [...iban.slice(4), ...iban.slice(0, 4)]
                    .map((c) => (/[a-z]/i.test(c) ? c.toLowerCase().charCodeAt(0) - 87 : c))
                    .join('')
            ) %
                97n ===
            1n
        );
    } catch (e) {
        return false;
    }
};

const IbanInput = (props: React.ComponentPropsWithRef<typeof TextInput>) => {
    const [value, onChange] = useWidgetState('', props.value, props.onChange);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.includes(' ')) {
            return;
        }

        if (!/^([A-Z]{0,2}|\d{0,2}|[A-Z0-9]{0,30})$/.test(e.target.value)) {
            return;
        }

        onChange(e);
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault();
        let pastedText = event.clipboardData.getData('text');
        pastedText = pastedText.replace(/\s/g, '');
        const input = event.target as HTMLInputElement;
        const startPos = input.selectionStart || 0;
        const endPos = input.selectionEnd || 0;
        input.value = input.value.substring(0, startPos) + pastedText + input.value.substring(endPos);
        input.setSelectionRange(startPos + pastedText.length, startPos + pastedText.length);
    };

    return <TextInput {...props} value={value} onChange={handleChange} onPaste={handlePaste} />;
};

export const invoiceToBatchTransferItem = (invoice: Invoice): BatchTransferItem => ({
    id: invoice.id,
    receiver: removeLineBreaks(invoice.receiver || ''),
    receiverIban: invoice.receiverIban || '',
    receiverBic: invoice.receiverBic || '',
    total: Math.abs(invoice.total) || 0,
    description: removeLineBreaks(invoice.invoiceNumber || invoice.description || ''),
    derivedFields: invoice.derivedFields || [],
});

export const bookingToBatchTransferItem = (booking: Booking): BatchTransferItem => ({
    id: booking.id,
    receiver: removeLineBreaks(booking.receiver || ''),
    receiverIban: booking.senderIban || '',
    receiverBic: booking.senderBic || '',
    total: Math.abs(booking.amount) || 0,
    description: removeLineBreaks(booking.description || ''),
    derivedFields: [],
});

const FORM_DEFAULT_VALUES = {
    id: '',
    receiver: '',
    receiverIban: '',
    receiverBic: '',
    total: 0,
    description: '',
};

const BatchTransferDrawerContext = React.createContext<{
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    items: BatchTransferItem[];
    setItems: (items: BatchTransferItem[]) => void;
    formItem: BatchTransferItem | null;
    setFormItem: (item: BatchTransferItem | null) => void;
}>({
    isOpen: false,
    setIsOpen: () => {},
    items: [],
    setItems: () => {},
    formItem: null,
    setFormItem: () => {},
});

export const BatchTransferDrawerProvider = ({ children }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useLocalStorage<BatchTransferItem[]>(BATCH_TRANSFER_KEY, []);
    const [formItem, setFormItem] = useState<BatchTransferItem | null>(null);

    const allItems = [...items, ...(formItem ? [formItem] : [])];

    return (
        <BatchTransferDrawerContext.Provider
            value={{
                isOpen,
                setIsOpen,
                items: allItems,
                setItems,
                formItem,
                setFormItem,
            }}
        >
            {children}
            <BatchTransferDrawer />
        </BatchTransferDrawerContext.Provider>
    );
};

export const useBatchTransferDrawer = () => React.useContext(BatchTransferDrawerContext);

const BatchTransferForm = ({
    item,
    onSubmit,
    onCancel,
}: {
    item?: BatchTransferItem;
    onSubmit: any;
    onCancel?: any;
}) => {
    const formMethods = useForm({ defaultValues: FORM_DEFAULT_VALUES });

    useEffect(() => {
        formMethods.reset({
            id: item?.id || '',
            receiver: item?.receiver || '',
            receiverIban: item?.receiverIban || '',
            receiverBic: item?.receiverBic || '',
            total: item?.total || 0,
            description: item?.description || '',
        });
    }, [item]);

    const dirtyFields = Object.keys(formMethods.formState.dirtyFields);
    const derivedFields = item?.derivedFields?.map(camelCase).filter((field) => !dirtyFields.includes(field)) || [];

    const handleSubmit = (values: any) =>
        // ensure total is a number
        onSubmit({
            ...values,
            total: parseFloat(values.total),
        });

    const iban = formMethods.watch('receiverIban');

    return (
        <Form
            formMethods={formMethods}
            className="flex flex-col gap-4 w-full p-4 border-b border-neutral-200 border-solid last:border-none"
            onSubmit={handleSubmit}
        >
            <Form.Field name="receiver">
                <StringField label="Empfänger" required />
            </Form.Field>

            <Form.Field name="receiverIban">
                <StringField
                    label="IBAN"
                    required
                    error={iban && !validateIban(iban) && 'IBAN ungültig'}
                    widget={IbanInput}
                    helpText={
                        derivedFields.includes('receiverIban') && (
                            <span className="text-indigo-600 flex gap-1 items-center">
                                <SparklesIcon />
                                Automatisch ermittelt aus vorherigen Rechnungen
                            </span>
                        )
                    }
                />
            </Form.Field>

            <Form.Field name="receiverBic">
                <StringField
                    label="BIC"
                    required
                    helpText={
                        derivedFields.includes('receiverBic') && (
                            <span className="text-indigo-600 flex gap-1 items-center">
                                <SparklesIcon />
                                Automatisch ermittelt aus vorherigen Rechnungen
                            </span>
                        )
                    }
                />
            </Form.Field>

            <Form.Field name="total">
                <DecimalField label="Betrag" required min={0} />
            </Form.Field>

            <Form.Field name="description">
                <StringField label="Verwendungszweck" required />
            </Form.Field>

            <div className="flex gap-2 justify-end">
                {onCancel && <Button onClick={onCancel}>Abbrechen</Button>}

                <Button
                    type="submit"
                    className="inline-flex items-center gap-1.5 !bg-black !text-white !border-black hover:!bg-neutral-800 shadow-none px-2.5"
                >
                    Speichern
                </Button>
            </div>
        </Form>
    );
};

const BatchTransferListItem = ({
    item,
    onChange,
    isEditing: propsIsEditing,
    onIsEditingChange,
    onRemove,
}: {
    item: BatchTransferItem;
    onChange: any;
    onRemove: any;
    isEditing?: boolean;
    onIsEditingChange?: any;
}) => {
    const [isEditing, setIsEditing] = useControllableState(false, propsIsEditing, onIsEditingChange);

    const handleChange = (values: any) => {
        onChange({ ...item, ...values });
        setIsEditing(false);
    };

    if (isEditing) {
        return <BatchTransferForm item={item} onSubmit={handleChange} onCancel={() => setIsEditing(false)} />;
    }

    return (
        <div className="flex gap-8 items-center p-4 bg-white border-b border-neutral-200 border-solid text-sm last:border-none">
            <div className="flex flex-col flex-1">
                <div className="font-medium">{item.receiver}</div>
                <div className="text-neutral-500">{item.description}</div>
            </div>

            <MoneyBadge amount={-1 * item.total} />

            <div className="ml-auto flex gap-2">
                <Button className="inline-flex" onClick={() => setIsEditing(true)}>
                    <Edit2Icon />
                </Button>

                <Button className="inline-flex" onClick={onRemove}>
                    <TrashIcon />
                </Button>
            </div>
        </div>
    );
};

const BatchTransferFooter = ({
    itemsAmount,
    itemsCount,
    onDownload,
}: {
    itemsAmount: number;
    itemsCount: number;
    onDownload: any;
}) => {
    return (
        <footer className="p-4 bg-neutral-100 w-full text-sm flex flex-col gap-4 items-center sticky bottom-0 border-t border-neutral-300">
            <div className="text-sm flex gap-2 items-center w-full">
                <span className="text-neutral-700">Total ({itemsCount} Einträge):</span>
                <MoneyBadge amount={itemsAmount > 0 ? -1 * itemsAmount : 0} />

                <div className="ml-auto">
                    <Button
                        className="inline-flex items-center gap-1.5 !bg-black !text-white !border-black hover:!bg-neutral-800 shadow-none px-2.5 disabled:opacity-50"
                        onClick={onDownload}
                        disabled={!itemsCount}
                    >
                        <DownloadIcon />
                        Herunterladen
                    </Button>
                </div>
            </div>
        </footer>
    );
};

const BatchTransferSuccess = ({
    onGoBack,
    onClear,
    downloadUrl,
}: {
    onGoBack: any;
    onClear: any;
    downloadUrl: string;
}) => {
    return (
        <>
            <div className="flex flex-col gap-4 p-5">
                <div className="text-lime-600 flex items-center">
                    <div className="w-5">
                        <CheckCircle2Icon />
                    </div>
                    <div>Sammelüberweisung erfolgreich erstellt</div>
                </div>

                <div className="text-sm text-neutral-600">
                    Um die Sammelüberweisung auszuführen, melde dich bei deinem Bankkonto an und lade die Datei hoch.
                </div>

                <div className="text-xs text-neutral-500">
                    Falls der automatische Download nicht gestartet wurde,{' '}
                    <a href={downloadUrl} download="batch-transfer.xml" className="underline text-blue-500">
                        klicke hier
                    </a>
                    .
                </div>
            </div>

            <footer className="p-4 bg-neutral-100 w-full text-sm flex flex-col gap-4 items-center sticky bottom-0 border-t border-neutral-300">
                <div className="text-sm flex gap-2 items-center justify-between w-full">
                    <Button onClick={onGoBack} variant="ghost" className="inline-flex items-center gap-1">
                        <ArrowLeftIcon />
                        Zurück
                    </Button>

                    <div className="flex flex-col items-center gap-2">
                        <Button onClick={onClear}>Neue Sammelüberweisung</Button>
                    </div>
                </div>
            </footer>
        </>
    );
};

const BatchTransferDrawer = () => {
    const { isOpen, setIsOpen, items, setItems, formItem, setFormItem } = useBatchTransferDrawer();

    const [showSuccess, setShowSuccess] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState('');

    const handleItemChange = (index: number, item: BatchTransferItem) => {
        const newItems = [...items];
        newItems[index] = item;
        setItems(newItems);
    };

    const handleItemRemove = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleItemAdd = (item: BatchTransferItem) => {
        setItems([item, ...items]);
    };

    const handleDownload = async () => {
        try {
            const response = await api.batchTransferFile.create({ items });
            // response is a xml file
            const url = URL.createObjectURL(new Blob([response]));
            setDownloadUrl(url);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'batch-transfer.xml';
            a.click();
            setShowSuccess(true);
            toast.success('Sammelüberweisung erfolgreich erstellt');
        } catch (e) {
            console.error(e);
            toast.error('Fehler beim Erstellen der Sammelüberweisung');
        }
    };

    const itemsAmount = items.reduce((acc, item) => acc + item.total, 0);
    const itemsCount = items.length;

    // test if id already in list of items
    const isFormItemNew = formItem && !items.some((item) => item.id === formItem?.id);

    return (
        <aside className="fixed bottom-0 right-20 rounded-t-xl w-[32rem] border border-neutral-300 shadow-2xl bg-white">
            <button
                className="w-full bg-neutral-800 flex gap-4 px-4 py-3 rounded-t-xl text-sm"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-white font-medium flex gap-2 items-center">
                    <BookmarkIcon /> Sammelüberweisung
                </span>
                <span className="text-neutral-400">{itemsCount} Einträge</span>

                <div className="ml-auto text-white">
                    <MinusIcon />
                </div>
            </button>

            {isOpen &&
                (!showSuccess ? (
                    <>
                        <section className="max-h-[40rem] overflow-auto w-full">
                            <div className="border-b border-neutral-200 border-solid text-sm text-neutral-700 bg-blue-50 p-4">
                                Mit der <b className="font-medium">Sammelüberweisung</b> lassen sich mehrere
                                Einzelaufträge zu einem gebündelten Sammelauftrag zusammenfassen.
                            </div>

                            {isFormItemNew && (
                                <BatchTransferForm
                                    item={formItem as BatchTransferItem}
                                    onSubmit={(item: BatchTransferItem) => {
                                        handleItemAdd(item);
                                        setFormItem(null);
                                    }}
                                    onCancel={() => setFormItem(null)}
                                />
                            )}

                            {items.map((item, index) => (
                                <BatchTransferListItem
                                    key={item.id + '-' + index}
                                    item={item}
                                    onChange={(item: BatchTransferItem) => handleItemChange(index, item)}
                                    onRemove={() => handleItemRemove(index)}
                                    isEditing={!!formItem && formItem?.id === item.id}
                                    onIsEditingChange={(isEditing: boolean) => {
                                        setFormItem(isEditing ? item : null);
                                    }}
                                />
                            ))}

                            {!items?.length && !isFormItemNew && (
                                <div className="p-4 text-neutral-400 text-sm text-center">
                                    Keine Einträge vorhanden.
                                </div>
                            )}
                        </section>

                        <BatchTransferFooter
                            itemsAmount={itemsAmount}
                            itemsCount={itemsCount}
                            onDownload={handleDownload}
                        />
                    </>
                ) : (
                    <BatchTransferSuccess
                        onClear={() => {
                            setItems([]);
                            setShowSuccess(false);
                        }}
                        onGoBack={() => setShowSuccess(false)}
                        downloadUrl={downloadUrl}
                    />
                ))}
        </aside>
    );
};

export default BatchTransferDrawer;
