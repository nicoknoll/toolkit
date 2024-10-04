import Field, { FieldProps } from './Field.tsx';
import Checkbox from '../widgets/Checkbox.tsx';
import { classnames } from '@nicoknoll/utils';
import Dynamic from '../../../utils/src/components/Dynamic.tsx';
import React, { useId } from 'react';

const BooleanField = ({
    label,
    error,
    helpText,
    className,
    widget,

    defaultValue,
    value,

    reverse,

    ...props
}: FieldProps<boolean> & {
    reverse?: true;
} & React.ComponentPropsWithRef<typeof Checkbox>) => {
    const id = useId();
    return (
        <Field
            className={classnames(
                'flex gap-2',
                reverse ? 'flex-row-reverse items-center' : 'flex-row  items-start',
                className
            )}
            data-error={error ? error : undefined}
            data-invalid={error ? '' : undefined}
        >
            <div className="flex-none">
                <Dynamic
                    defaultChecked={defaultValue}
                    checked={value}
                    className={classnames(!reverse && 'mt-0.5')}
                    component={widget || Checkbox}
                    {...props}
                    id={props.id || id}
                />
            </div>
            <div className="flex-1">
                {label && (
                    <Field.Label required={props.required} htmlFor={props.id || id}>
                        {label}
                    </Field.Label>
                )}
                {error ? <Field.Error>{error}</Field.Error> : helpText && <Field.HelpText>{helpText}</Field.HelpText>}
            </div>
        </Field>
    );
};

export default BooleanField;
