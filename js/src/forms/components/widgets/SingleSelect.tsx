import Select, { Option, useSelectNative } from './Select.tsx';
import * as React from 'react';
import { useState } from 'react';
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from 'lucide-react';
import Popover from '../Popover.tsx';
import { classnames } from '../../../../utils/classnames.ts';
import Widget, { useWidgetState, WidgetProps } from './Widget.tsx';
import setNativeInputValue, { setNativeSelectValue } from '../../../../utils/setNativeInputValue.ts';

const SingleSelectOption = ({ value, label, disabled = false }: Option) => {
    return (
        <Select.Option
            value={value}
            className="flex items-center gap-1 ui-highlighted:bg-neutral-100 ui-disabled:opacity-50 text-sm px-2 py-1 rounded text-neutral-700"
            disabled={disabled}
        >
            <span className="flex justify-center items-center w-4 h-4">
                <Select.OptionIndicator>
                    <CheckIcon />
                </Select.OptionIndicator>
            </span>

            <Select.OptionText>{label || value}</Select.OptionText>
        </Select.Option>
    );
};

export interface SingleSelectProps extends React.ComponentPropsWithRef<'select'> {
    options: (Option | [string, Option[]])[];

    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;

    allowAddOption?: boolean;
    onAddOption?: (value: string) => void;

    placeholder?: string;
    searchPlaceholder?: string;
    emptyLabel?: string;

    hideClear?: boolean;

    // select props
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    onFocus?: (event: React.FocusEvent<HTMLSelectElement>) => void;
}

export const SingleSelect = ({
    // widget props
    widgetRef,
    controls,

    // single select props
    options,
    defaultOpen,
    open,
    onOpenChange,

    allowAddOption,
    onAddOption,

    placeholder,
    searchPlaceholder,
    emptyLabel,

    hideClear = false,

    // remaining are select props we can pass down
    // the ones mentioned here are the ones we want to override
    className,
    value: propsValue,
    onChange: propsOnChange,
    onFocus: propsOnFocus,

    ...selectProps
}: SingleSelectProps & WidgetProps) => {
    const triggerRef = React.useRef<HTMLButtonElement>(null);

    const [value, onChange] = useWidgetState('', propsValue, propsOnChange);

    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [search, setSearch] = useState<string | undefined>('');

    const handleOpenChange = (open: boolean | undefined) => {
        setIsPopoverOpen(!!open);
        if (!open) triggerRef.current?.focus();
    };

    const { onSelectedChange, selectNativeProps } = useSelectNative({
        focusRef: triggerRef,
        onFocus: propsOnFocus,
        value,
        onChange,
    });

    const handleClear = (e: React.MouseEvent) => {
        setNativeSelectValue(selectNativeProps.ref.current!, '');
        // prevent the popover from opening
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <Popover open={isPopoverOpen}>
            <Select
                search={search}
                onSearchChange={setSearch}
                selected={value}
                onSelectedChange={onSelectedChange}
                open={isPopoverOpen}
                onOpenChange={handleOpenChange}
                allowAddOption={allowAddOption}
                required={selectProps.required}
                disabled={selectProps.disabled}
                highlightOnMouseOver
            >
                <Popover.Anchor>
                    <Select.Trigger asChild>
                        <Widget
                            variant="button"
                            disabled={selectProps.disabled}
                            ref={widgetRef}
                            className={classnames('flex gap-1 justify-between w-full group rounded', className)}
                        >
                            <Widget.Content asChild>
                                <button
                                    ref={triggerRef}
                                    className="px-2 py-1.5 pr-0 cursor-default"
                                    disabled={selectProps.disabled}
                                    type="button"
                                >
                                    <Select.Value
                                        placeholder={placeholder === undefined ? emptyLabel : placeholder}
                                        className="ui-placeholder:text-neutral-400 ui-placeholder:font-normal min-h-5"
                                    />
                                </button>
                            </Widget.Content>

                            <Widget.Controls>
                                {value && !hideClear && !selectProps.required ? (
                                    <Widget.ControlButton className="!bg-transparent" onClick={handleClear}>
                                        <XIcon />
                                    </Widget.ControlButton>
                                ) : (
                                    <Widget.ControlButton className="pointer-events-none">
                                        <ChevronDownIcon
                                            className={classnames(
                                                'text-neutral-400 transition-colors',
                                                !selectProps.disabled && 'group-hover:text-neutral-700'
                                            )}
                                        />
                                    </Widget.ControlButton>
                                )}
                                {controls}
                            </Widget.Controls>
                        </Widget>
                    </Select.Trigger>
                </Popover.Anchor>

                <Popover.Content
                    className="p-0 min-w-0"
                    onOpenAutoFocus={(e) => {
                        e.preventDefault();
                    }}
                    align="start"
                    forceMount
                    disableInteractions={!isPopoverOpen}
                >
                    <Select.Content className="flex flex-col gap-2 p-2">
                        <div className="relative w-full min-w-0">
                            <span className="absolute top-1/2 left-2 transform -translate-y-1/2 text-neutral-400 text-xl">
                                <SearchIcon className="!w-3.5 !h-3.5" />
                            </span>

                            <Widget variant="input" asChild disabled={selectProps.disabled}>
                                <Select.Search
                                    className="rounded px-2 py-1 pl-7 bg-transparent w-full min-w-0"
                                    placeholder={searchPlaceholder}
                                />
                            </Widget>
                        </div>

                        <div className="flex flex-col">
                            {allowAddOption && search && (
                                <SingleSelectOption value={search} label={search} disabled={!search} />
                            )}

                            {!selectProps.required && (
                                <SingleSelectOption value="" label={emptyLabel} disabled={false} />
                            )}

                            {options.map((option: Option | [string, Option[]]) => {
                                if (Array.isArray(option)) {
                                    const [label, options] = option;
                                    return (
                                        <React.Fragment key={label}>
                                            <Select.Separator className="border-t border-neutral-200 my-2" />
                                            <Select.Group className="flex flex-col">
                                                <Select.GroupLabel className="font-medium text-sm px-2 py-1 pl-7">
                                                    {label}
                                                </Select.GroupLabel>
                                                {options.map((option: Option) => (
                                                    <SingleSelectOption key={option.value} {...option} />
                                                ))}
                                            </Select.Group>
                                        </React.Fragment>
                                    );
                                }

                                return <SingleSelectOption key={option.value} {...option} />;
                            })}
                        </div>
                    </Select.Content>
                </Popover.Content>

                <Widget.Native>
                    <Select.Native {...selectProps} {...selectNativeProps} />
                </Widget.Native>
            </Select>
        </Popover>
    );
};

export default SingleSelect;
