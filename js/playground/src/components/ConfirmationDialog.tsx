import * as React from 'react';
import { classnames } from '@nicoknoll/utils';
import Button from '../../../packages/forms/src/misc/Button.tsx';
import Dialog from './Dialog.tsx';

const ConfirmationDialogContext = React.createContext<any>(null);
export const useConfirmationDialogContext = () => {
    const context = React.useContext(ConfirmationDialogContext);
    if (!context) {
        throw new Error('ConfirmationDialogContext must be used within a ConfirmationDialogProvider');
    }
    return context;
};
export const ConfirmationDialogProvider = ({ children }: { children: any }) => {
    const [dialogProps, setDialogProps] = React.useState<any>(null);

    const confirm = (title: string, message: string = '', options: any = {}) => {
        const handleConfirm = () => {
            return Promise.resolve(options?.onConfirm?.()).then(() => {
                setDialogProps(null);
            });
        };

        const handleCancel = () => {
            return Promise.resolve(options?.onCancel?.()).then(() => {
                setDialogProps(null);
            });
        };

        setDialogProps({ title, message, ...options, onConfirm: handleConfirm, onCancel: handleCancel });
    };

    return (
        <ConfirmationDialogContext.Provider value={confirm}>
            {children}
            {dialogProps && <ConfirmationDialog {...dialogProps} />}
        </ConfirmationDialogContext.Provider>
    );
};

const ConfirmationDialog = ({
    className,
    isLoading,
    onConfirm,
    onCancel,
    title,
    message,
    danger,
    confirmLabel = 'Bestätigen',
    cancelLabel = 'Abbrechen',
}: any) => {
    return (
        <Dialog open={true}>
            <Dialog.Content className={className}>
                <div className="flex flex-col gap-6">
                    <Dialog.Title asChild>
                        <h1 className="text-lg font-medium">{title}</h1>
                    </Dialog.Title>

                    {message && <div className="text-sm">{message}</div>}

                    <div className="flex gap-2 justify-end">
                        <Button type="button" onClick={onCancel}>
                            {cancelLabel}
                        </Button>
                        <Button
                            onClick={onConfirm}
                            className={classnames(
                                'inline-flex items-center gap-1.5 !bg-black !text-white !border-black hover:!bg-neutral-800 shadow-none px-2.5 disabled:opacity-50',
                                danger && '!bg-red-700 !border-red-700 hover:!bg-red-800 hover:!border-red-800'
                            )}
                            loading={isLoading}
                            disabled={isLoading}
                        >
                            {confirmLabel}
                        </Button>
                    </div>
                </div>
            </Dialog.Content>
        </Dialog>
    );
};

export default ConfirmationDialog;
