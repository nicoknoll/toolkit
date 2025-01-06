import Field, { FieldProps } from './Field.tsx';
import Checkbox from '../widgets/Checkbox.tsx';
import { classnames } from '@nicoknoll/utils';
import Dynamic from '../../../utils/src/components/Dynamic.tsx';
import React, { useId } from 'react';

type BooleanChangeEvent = Omit<React.ChangeEvent<HTMLInputElement>, 'target'> & {
    target: Omit<React.ChangeEvent<HTMLInputElement>['target'], 'value'> & { value: boolean };
};

const BooleanField = ({
    label,
    error,
    helpText,
    className,
    widget,

    defaultValue,
    value,
    onChange,

    reverse,
    ...props
}: Omit<FieldProps<boolean>, 'onChange'> &
    Omit<React.ComponentPropsWithRef<typeof Checkbox>, 'onChange'> & {
        reverse?: true;
        onChange?: (event: BooleanChangeEvent) => void;
    }) => {
    const id = useId();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.({
            ...event,
            target: {
                ...event.target,
                value: Boolean(event.target.checked),
            },
        } as BooleanChangeEvent);
    };

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
                    onChange={handleChange}
                    {...props}
                    id={props.id || id}
                />
            </div>
            {label || error || helpText ? (
                <div className="flex-1">
                    {label && (
                        <Field.Label required={props.required} htmlFor={props.id || id}>
                            {label}
                        </Field.Label>
                    )}
                    {error ? (
                        <Field.Error>{(error as any)?.message || error}</Field.Error>
                    ) : (
                        helpText && <Field.HelpText>{helpText}</Field.HelpText>
                    )}
                </div>
            ) : null}
        </Field>
    );
};

export default BooleanField;
