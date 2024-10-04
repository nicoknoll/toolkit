import React from 'react';
import Select, { Option } from './Select.tsx';
import Radio from './Radio.tsx';
import { SingleSelectProps } from './SingleSelect.tsx';
import { classnames } from '@nicoknoll/utils';
import { useWidgetState } from './Widget.tsx';

const RadioGroupItem = ({
    label,
    ...radioProps
}: React.ComponentPropsWithRef<typeof Radio> & { label?: React.ReactNode }) => {
    return (
        <label className="flex items-center gap-2 py-1 text-sm">
            <Radio {...radioProps} />
            <span>{label}</span>
        </label>
    );
};

const RadioGroup = ({
    options,
    name,
    className,

    disabled,
    required,

    emptyLabel,

    ...props
}: SingleSelectProps & { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
    const [value, onChange] = useWidgetState('', props.value, props.onChange);

    return (
        <div className={classnames('flex flex-col', className)}>
            {!required && (
                <RadioGroupItem
                    disabled={disabled}
                    required={required}
                    value=""
                    checked={!value}
                    onChange={onChange}
                    name={name}
                    label={emptyLabel}
                />
            )}

            {options.map((option: Option | [string, Option[]]) => {
                if (Array.isArray(option)) {
                    const [label, options] = option;
                    return (
                        <React.Fragment key={label}>
                            <Select.Separator className="border-t border-neutral-200 my-2" />
                            <Select.Group className="flex flex-col">
                                <Select.GroupLabel className="font-medium text-sm px-2 py-1 !pl-7">
                                    {label}
                                </Select.GroupLabel>
                                {options.map((option: Option) => (
                                    <RadioGroupItem
                                        key={option.value}
                                        disabled={disabled}
                                        required={required}
                                        {...option}
                                        checked={value === option.value}
                                        onChange={onChange}
                                        name={name}
                                    />
                                ))}
                            </Select.Group>
                        </React.Fragment>
                    );
                }

                return (
                    <RadioGroupItem
                        key={option.value}
                        disabled={disabled}
                        required={required}
                        {...option}
                        checked={value === option.value}
                        onChange={onChange}
                        name={name}
                    />
                );
            })}
        </div>
    );
};

export default RadioGroup;
