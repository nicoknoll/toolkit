import * as React from 'react';
import { useEffect, useRef } from 'react';
import { classnames, mergeRefs, useControllableState } from '@nicoknoll/utils';
import { createPortal } from 'react-dom';
import { Slot } from '@radix-ui/react-slot';

interface DialogProps extends React.ComponentPropsWithRef<'div'> {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    closeOnOutsideClick?: boolean;
    closeOnEscape?: boolean;
}

const Dialog = ({
    ref,
    children,
    open,
    onOpenChange,
    closeOnOutsideClick,
    closeOnEscape = true,
    ...props
}: DialogProps) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    const [isDialogOpen, setIsDialogOpen] = useControllableState(false, open, onOpenChange);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!closeOnEscape) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsDialogOpen(false);
                setOverflowDisabled(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!closeOnOutsideClick) return;

        setIsDialogOpen(false);
        setOverflowDisabled(false);
    };

    const setOverflowDisabled = (isDisabled: boolean) => {
        document.body.style.overflow = isDisabled ? 'hidden' : '';
    };

    useEffect(() => {
        if (isDialogOpen) {
            previousActiveElement.current = document.activeElement as HTMLElement;
            dialogRef.current?.focus();
            setOverflowDisabled(true);
        } else {
            setOverflowDisabled(false);
            previousActiveElement.current?.focus();
        }
    }, [isDialogOpen]);

    useEffect(() => {
        // on unmount
        return () => {
            setOverflowDisabled(false);
            previousActiveElement.current?.focus();
        };
    }, []);

    return createPortal(
        <div
            ref={mergeRefs(ref, dialogRef)}
            className={classnames('fixed inset-0', isDialogOpen ? 'block' : 'hidden')}
            tabIndex={-1}
            {...props}
        >
            <div className="fixed inset-0 bg-black bg-opacity-75" onClick={handleBackdropClick} />

            {children}
        </div>,
        document.body
    );
};

const DialogContent = ({
    children,
    className,
    asChild,
    ...props
}: React.ComponentPropsWithRef<'div'> & { asChild?: boolean }) => {
    const Component = asChild ? Slot : 'div';
    return (
        <Component
            className={classnames(
                'bg-white rounded-2xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 px-7 flex flex-col gap-8 max-h-[90vh] overflow-auto w-[60rem] outline-none',
                className
            )}
            {...props}
        >
            {children}
        </Component>
    );
};

const DialogTitle = ({ children, asChild, ...props }: React.ComponentPropsWithRef<'h1'> & { asChild?: boolean }) => {
    const Component = asChild ? Slot : 'h1';
    return (
        <Component className="text-lg font-medium" {...props}>
            {children}
        </Component>
    );
};

export default Object.assign(Dialog, { Content: DialogContent, Title: DialogTitle });
