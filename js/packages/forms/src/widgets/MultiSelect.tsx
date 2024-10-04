import * as React from 'react';
import { useContext, useRef } from 'react';
import { CheckIcon, XIcon } from 'lucide-react';
import { useControllableState } from '@nicoknoll/utils';
import Select, { Option, SelectContext, Slottable, useSelectNative } from './Select.tsx';
import { Slot } from '@radix-ui/react-slot';
import Widget, { useWidgetState, WidgetProps } from './Widget.tsx';
import { classnames } from '@nicoknoll/utils';
import Popover from '../misc/Popover.tsx';

interface TagProps extends React.ComponentPropsWithRef<'span'> {
    children: React.ReactNode;
    onRemove: (e: any) => void;
    disabled?: boolean;
}

const Tag = ({ children, onRemove, disabled, ...props }: TagProps) => {
    return (
        <span
            className={classnames(
                'rounded bg-neutral-100 px-2 flex items-center gap-1 text-sm cursor-default border border-neutral-300 py-px',
                !disabled && 'pr-1'
            )}
            {...props}
        >
            {children}

            {!disabled && (
                <button
                    onClick={onRemove}
                    type="button"
                    className="text-neutral-500 hover:text-neutral-700 cursor-pointer"
                    tabIndex={-1}
                >
                    <XIcon />
                </button>
            )}
        </span>
    );
};

interface ValueTagsProps extends Omit<React.ComponentPropsWithRef<'span'>, 'children'>, Slottable {
    disabled?: boolean;
}

const ValueTags = ({ asChild, disabled, ...props }: ValueTagsProps): React.ReactNode => {
    const { selectedOptions, selected, onSelectedChange, getSelectedItemProps } = useContext(SelectContext)! as any;

    if (!selectedOptions.length) return null;

    const Comp = asChild ? Slot : 'span';
    return (
        <Comp {...props}>
            {selectedOptions?.map((option: Option, index: number) => (
                <Tag
                    key={option.value}
                    onRemove={(e) => {
                        e.stopPropagation();
                        onSelectedChange?.(selected?.filter((v: string) => v !== option.value));
                    }}
                    {...getSelectedItemProps({
                        selectedItem: option,
                        index,
                    })}
                    disabled={disabled}
                >
                    {option.label}
                </Tag>
            ))}
        </Comp>
    );
};

const MultiSelectOption = ({ value, label, disabled = false, checked = false }: Option) => {
    return (
        <Select.Option
            value={value}
            className={classnames(
                'flex items-center gap-2 text-sm px-2 py-1 pl-1 rounded text-neutral-700 cursor-default group',
                'ui-highlighted:bg-neutral-100 ui-disabled:opacity-50 '
            )}
            disabled={disabled}
        >
            <Widget
                variant="checkable"
                checked={checked}
                disabled={disabled}
                className={classnames(
                    'flex justify-center items-center w-5 h-5 rounded text-white',
                    'group-ui-state-checked:bg-theme-600 group-ui-state-checked:border-transparent'
                )}
            >
                <Select.OptionIndicator>
                    <CheckIcon />
                </Select.OptionIndicator>
            </Widget>

            <Select.OptionText>{label || value}</Select.OptionText>
        </Select.Option>
    );
};

export interface MultiSelectProps extends React.ComponentPropsWithRef<'select'> {
    options: (Option | [string, Option[]])[];

    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;

    allowAddOption?: boolean;
    onAddOption?: (value: string) => void;

    placeholder?: string;
    searchPlaceholder?: string;
    emptyLabel?: string;

    // select props
    value?: string[];
    onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    onFocus?: (event: React.FocusEvent<HTMLSelectElement>) => void;
}

const MultiSelect = ({
    // widget props
    widgetRef,
    controls,

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
}: MultiSelectProps & WidgetProps) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const [isPopoverOpen, setIsPopoverOpen] = useControllableState(propsDefaultOpen, propsOpen, propsOnOpenChange);
    const [search, setSearch] = React.useState<string>('');

    const [value, onChange] = useWidgetState([], propsValue, propsOnChange);

    const { onSelectedChange, selectNativeProps } = useSelectNative({
        focusRef: searchRef,
        onFocus: propsOnFocus,
        value,
        onChange,
    });

    return (
        <Popover open={isPopoverOpen}>
            <Select
                ref={rootRef}
                selected={value}
                onSelectedChange={onSelectedChange}
                // open={isPopoverOpen}
                onOpenChange={setIsPopoverOpen}
                allowAddOption={allowAddOption}
                // @ts-ignore
                onSearchChange={setSearch}
                required={selectProps.required}
                disabled={selectProps.disabled}
                multiple
                highlightOnMouseOver
            >
                <Popover.Anchor>
                    <Select.Trigger
                        onClick={(e) => {
                            e.preventDefault();
                            searchRef.current?.focus();
                        }}
                        disabled={selectProps.disabled}
                        asChild
                    >
                        <Widget ref={widgetRef}>
                            <Widget.Content className={classnames('flex gap-1 p-1 flex-wrap')}>
                                <ValueTags className="flex gap-1 flex-wrap" disabled={selectProps.disabled} />

                                <div className="flex-auto min-w-0 relative">
                                    <div className="p-1 py-0.5 invisible min-w-20 text-sm whitespace-nowrap">
                                        {/* TODO: find better way to keep the placeholder line height */}
                                        {search || '&nbsp;'}
                                    </div>

                                    <Select.Search
                                        ref={searchRef}
                                        className="!outline-none absolute w-full top-0 left-0 p-1 py-0.5 text-sm placeholder:text-neutral-400 bg-transparent"
                                        placeholder={placeholder}
                                        disabled={selectProps.disabled}
                                    />
                                </div>
                            </Widget.Content>

                            <Widget.Controls>{controls}</Widget.Controls>
                        </Widget>
                    </Select.Trigger>
                </Popover.Anchor>

                <Popover.Content
                    className={classnames('min-w-0 p-0')}
                    onOpenAutoFocus={(e) => {
                        e.preventDefault();
                    }}
                    align="start"
                    forceMount
                    disableInteractions={!isPopoverOpen}
                >
                    <Select.Content className="flex flex-col p-2">
                        {allowAddOption && search && (
                            <MultiSelectOption value={search} label={search} disabled={!search} />
                        )}

                        {options.map((option: Option | [string, Option[]]) => {
                            if (Array.isArray(option)) {
                                const [label, options] = option;
                                return (
                                    <React.Fragment key={label}>
                                        <Select.Separator className="border-t border-neutral-200 my-2" />
                                        <Select.Group className="flex flex-col">
                                            <Select.GroupLabel className="font-medium text-sm px-2 py-1 pl-8">
                                                {label}
                                            </Select.GroupLabel>
                                            {options.map((option: Option) => (
                                                <MultiSelectOption
                                                    key={option.value}
                                                    {...option}
                                                    checked={value?.includes(option.value)}
                                                />
                                            ))}
                                        </Select.Group>
                                    </React.Fragment>
                                );
                            }

                            return (
                                <MultiSelectOption
                                    key={option.value}
                                    {...option}
                                    checked={value?.includes(option.value)}
                                />
                            );
                        })}
                    </Select.Content>
                </Popover.Content>

                <Widget.Native>
                    <Select.Native {...selectProps} {...selectNativeProps} />
                </Widget.Native>
            </Select>
        </Popover>
    );
};

export default MultiSelect;
