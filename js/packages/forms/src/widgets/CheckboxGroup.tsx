import React, { useState } from 'react';
import Select, { Option, useSelectNative } from './Select.tsx';
import { MultiSelectProps } from './MultiSelect.tsx';
import { CheckIcon } from 'lucide-react';
import Widget, { useWidgetState } from './Widget.tsx';

const CheckboxGroupItem = ({ value, label, disabled = false, checked }: Option) => {
    return (
        <Select.Option value={value} className="flex items-center gap-2 py-1 text-sm group" disabled={disabled}>
            <Widget
                variant="checkable"
                disabled={disabled}
                checked={checked}
                className="relative flex items-center justify-center w-5 h-5 rounded text-white"
            >
                <Widget.Content className="items-center justify-center">
                    <Select.OptionIndicator>
                        <CheckIcon />
                    </Select.OptionIndicator>
                </Widget.Content>
            </Widget>

            <Select.OptionText className="cursor-default">{label || value}</Select.OptionText>
        </Select.Option>
    );
};

const CheckboxGroup = ({
    // multi select props
    options,
    defaultOpen: propsDefaultOpen = false,
    open: propsOpen,
    onOpenChange: propsOnOpenChange,

    allowAddOption,
    onAddOption,

    placeholder,

    // remaining are select props we can pass down
    // the ones mentioned here are the ones we want to override
    value: propsValue,
    onChange: propsOnChange,
    onFocus: propsOnFocus,

    ...selectProps
}: MultiSelectProps) => {
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState<boolean | undefined>(false);

    const [value, onChange] = useWidgetState([], propsValue, propsOnChange);

    const { onSelectedChange, selectNativeProps } = useSelectNative({
        focusRef: triggerRef,
        onFocus: propsOnFocus,
        value,
        onChange,
    });
    return (
        <Select
            selected={value}
            onSelectedChange={onSelectedChange}
            disabled={selectProps.disabled}
            multiple
            open={open}
            onOpenChange={setOpen}
            className="relative"
        >
            <Select.Trigger
                ref={triggerRef}
                className="!outline-none absolute w-0 h-0"
                onFocus={() => setOpen(true)}
                disabled={selectProps.disabled}
            />

            <Select.Content className="flex flex-col items-start">
                {options.map((option: Option | [string, Option[]]) => {
                    if (Array.isArray(option)) {
                        const [label, options] = option;
                        return (
                            <React.Fragment key={label}>
                                <Select.Separator className="border-t border-neutral-200 my-2 w-full" />
                                <Select.Group className="flex flex-col">
                                    <Select.GroupLabel className="font-medium text-sm px-2 py-1 !pl-7">
                                        {label}
                                    </Select.GroupLabel>
                                    {options.map((option: Option) => (
                                        <CheckboxGroupItem
                                            key={option.value}
                                            {...option}
                                            disabled={selectProps.disabled}
                                            checked={value?.includes(option.value)}
                                        />
                                    ))}
                                </Select.Group>
                            </React.Fragment>
                        );
                    }
                    return (
                        <CheckboxGroupItem
                            key={option.value}
                            {...option}
                            disabled={selectProps.disabled}
                            checked={value?.includes(option.value)}
                        />
                    );
                })}
            </Select.Content>

            <Widget.Native>
                <Select.Native {...selectProps} {...selectNativeProps} />
            </Widget.Native>
        </Select>
    );
};

export default CheckboxGroup;
