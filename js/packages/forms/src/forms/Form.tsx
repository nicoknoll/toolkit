import * as React from 'react';
import {
    Controller,
    ControllerProps,
    FieldError,
    FieldValues,
    FormProvider,
    SubmitHandler,
    useForm,
    useFormContext,
    UseFormReturn,
} from 'react-hook-form';
import isMultipleSelect from '../utils/isMultipleSelect.ts';
import { Slot } from '@radix-ui/react-slot';
import { Slottable } from '../widgets/Select.tsx';

interface FormProps<TFieldValues extends FieldValues = FieldValues>
    extends Omit<React.ComponentPropsWithRef<'form'>, 'onSubmit'> {
    children: React.ReactNode;
    onSubmit: SubmitHandler<TFieldValues>;
    formMethods?: UseFormReturn<TFieldValues>;
    onIsSubmittingChange?: (isSubmitting: boolean) => void;
}

const Form = <TFieldValues extends FieldValues = FieldValues>({
    children,
    onSubmit,
    formMethods,
    onIsSubmittingChange,
    ...props
}: FormProps<TFieldValues>) => {
    const methods = formMethods || useForm<TFieldValues>();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        onIsSubmittingChange?.(true);
        const result = await Promise.resolve(methods.handleSubmit(onSubmit)(event));
        onIsSubmittingChange?.(false);
        return result;
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit} {...props}>
                {children}
            </form>
        </FormProvider>
    );
};

interface FormFieldProps extends Omit<ControllerProps, 'render'> {
    children: React.ReactElement;
}

const FormField = ({ children, ...props }: FormFieldProps) => {
    const { control } = useFormContext();

    return (
        <Controller
            {...props}
            control={control}
            render={({ field: { onChange, ...field }, fieldState, formState }) => {
                const handleChange = (event: { target: any }) => {
                    if (isMultipleSelect(event.target)) {
                        // This case is not properly handled by react-hook-form
                        onChange(Array.from(event.target.selectedOptions, (option) => option.value));
                    } else if (event.target.type === 'file') {
                        // This case is not properly handled by react-hook-form
                        if (event.target.multiple) {
                            onChange(Array.from(event.target.files));
                        } else {
                            onChange(event.target.files[0] || null);
                        }
                    } else {
                        onChange(event);
                    }
                };

                const slotProps = {
                    ...field,
                    error: fieldState.error,
                    // formState,
                    onChange: handleChange,
                };

                return <Slot {...slotProps}>{children}</Slot>;
            }}
        />
    );
};

const FormButton = ({
    asChild,
    loading,
    ...props
}: React.ComponentPropsWithRef<'button'> & Slottable & { loading?: boolean }) => {
    const { formState } = useFormContext();
    const Comp = asChild ? Slot : 'button';
    const compProps = asChild
        ? {
              loading: loading !== undefined ? loading : formState.isSubmitting,
          }
        : {};

    return <Comp {...compProps} {...props} />;
};

const FormError = ({
    asChild,
    name = 'root',
    ...props
}: React.ComponentPropsWithRef<'div'> & Slottable & { name?: string }) => {
    const {
        formState: { errors },
    } = useFormContext();
    const error: FieldError = errors?.[name] as FieldError;
    const Comp = asChild ? Slot : 'div';
    return error ? <Comp {...props} data-error={error.message} /> : null;
};

const FormErrorMessage = ({
    name = 'root',
    ...props
}: React.ComponentPropsWithRef<'span'> & Slottable & { name?: string }) => {
    const {
        formState: { errors },
    } = useFormContext();
    const error: FieldError = errors?.[name] as FieldError;
    return error ? error.message : null;
};

export default Object.assign(Form, {
    Field: FormField,
    Button: FormButton,
    Error: FormError,
    ErrorMessage: FormErrorMessage,
});

export { useFormContext } from 'react-hook-form';
