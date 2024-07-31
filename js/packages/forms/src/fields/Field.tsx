import { classnames } from '../utils/classnames.ts';
import TextInput from '../widgets/TextInput.tsx';
import * as React from 'react';
import Dynamic from '../misc/Dynamic.tsx';
import { useId } from 'react';

export interface FieldProps<T> {
    // field component props
    label?: React.ReactNode;
    error?: React.ReactNode;
    helpText?: React.ReactNode;
    widget?: any;
    className?: string;

    // re-used field element props
    ref?: (element: HTMLInputElement) => void;
    id?: string;
    name?: string;

    // determine the state
    required?: boolean;
    disabled?: boolean;

    // invalid?: boolean;  -> same as error ?
    // valid?: boolean;

    placeholder?: React.ReactNode | string;

    // default form handling props
    defaultValue?: T;
    value?: T;
    onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

interface FieldRootProps extends React.ComponentPropsWithRef<'div'> {}

const FieldRoot = ({ className, ...props }: FieldRootProps) => {
    return <div className={classnames('flex flex-col gap-1', className)} {...props} />;
};

interface FieldLabelProps extends React.ComponentPropsWithRef<'label'> {
    required?: boolean;
}

const FieldLabel = ({ className, ...props }: FieldLabelProps) => {
    return (
        <label className={classnames('text-sm font-medium', className)} {...props}>
            {props.children} {props.required && <span className="text-red-500">*</span>}
        </label>
    );
};

interface FieldErrorProps extends React.ComponentPropsWithRef<'p'> {}

const FieldError = ({ className, ...props }: FieldErrorProps) => {
    return <p className={classnames('text-sm text-error-500', className)} {...props} />;
};

interface FieldHelpTextProps extends React.ComponentPropsWithRef<'p'> {}

const FieldHelpText = ({ className, ...props }: FieldHelpTextProps) => {
    return <p className={classnames('text-sm text-neutral-500', className)} {...props} />;
};

interface SimpleFieldProps<T> extends FieldProps<T> {
    isNative?: true;

    // remaining props come from the widget props
    [key: string]: any;
}

export const SimpleField = <T,>({
    label,
    error,
    helpText,
    widget,
    className,

    ...props
}: SimpleFieldProps<T>) => {
    const id = useId();
    return (
        <FieldRoot className={className} data-error={error ? error : undefined} data-invalid={error ? '' : undefined}>
            {label && (
                <FieldLabel required={props.required} htmlFor={props.id || id}>
                    {label}
                </FieldLabel>
            )}

            <Dynamic component={widget || TextInput} {...props} id={props.id || id} />

            {helpText && <FieldHelpText>{helpText}</FieldHelpText>}
            {error && <FieldError>{error}</FieldError>}
        </FieldRoot>
    );
};

export default Object.assign(FieldRoot, {
    Label: FieldLabel,
    Error: FieldError,
    HelpText: FieldHelpText,
});
