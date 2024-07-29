import * as React from 'react';
import {
    Controller,
    ControllerProps,
    FieldElement,
    FieldError,
    FieldValues,
    FormProvider,
    SubmitHandler,
    useForm,
    useFormContext,
    UseFormReturn,
    UseFormStateReturn,
} from 'react-hook-form';
import isMultipleSelect from '../../../../utils/isMultipleSelect.ts';
import { Slot } from '@radix-ui/react-slot';

interface FormProps<TFieldValues extends FieldValues = FieldValues>
    extends Omit<React.ComponentPropsWithRef<'form'>, 'onSubmit'> {
    children: React.ReactNode;
    onSubmit: SubmitHandler<TFieldValues>;
    formMethods?: UseFormReturn<TFieldValues>;
}

const Form = <TFieldValues extends FieldValues = FieldValues>({
    children,
    onSubmit,
    formMethods,
    ...props
}: FormProps<TFieldValues>) => {
    const methods = formMethods || useForm<TFieldValues>();

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} {...props}>
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
                            onChange(event.target.files[0]);
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
export default Object.assign(Form, { Field: FormField });
