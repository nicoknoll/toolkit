import Select, { Option, useSelectNative } from './Select.tsx';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { CheckIcon, ChevronsUpDownIcon, SearchIcon, XIcon } from 'lucide-react';
import Popover from '../misc/Popover.tsx';
import { classnames } from '@nicoknoll/utils';
import Widget, { useWidgetState, WidgetProps } from './Widget.tsx';
import { setNativeSelectValue } from '../utils/setNativeInputValue.ts';

const SingleSelectOption = ({
    value,
    label,
    disabled = false,
    className,
    index = undefined,
    hideCheck = false,
}: Option) => {
    return (
        <Select.Option
            value={value}
            className={classnames(
                'flex items-center gap-1 ui-highlighted:bg-neutral-100 ui-disabled:opacity-50 text-sm px-2 py-1 rounded text-neutral-700 select-none',
                className
            )}
            disabled={disabled}
            index={index}
        >
            {!hideCheck && (
                <span className="flex justify-center items-center w-4 h-4 flex-none">
                    <Select.OptionIndicator>
                        <CheckIcon />
                    </Select.OptionIndicator>
                </span>
            )}

            <Select.OptionText>{label || value}</Select.OptionText>
        </Select.Option>
    );
};

const MemoSingleSelectOption = React.memo(SingleSelectOption);

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

    hideSearch?: boolean;
    hideCheck?: boolean;
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

    hideSearch = false,
    hideCheck = false,
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
    const searchRef = React.useRef<HTMLInputElement>(null);

    // we need to mount it once to collect the initial options
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setTimeout(() => {
            setIsMounted(true);
        }, 0);
    }, []);

    const [value, onChange] = useWidgetState('', propsValue, propsOnChange);

    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [search, setSearch] = useState<string | undefined>('');

    const handleOpenChange = (open: boolean | undefined) => {
        setIsPopoverOpen(!!open);
        if (!open) {
            setTimeout(() => {
                triggerRef.current?.focus();
            }, 10);
        }
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

    const optionValues = options?.flatMap((option) => {
        if (Array.isArray(option)) {
            return option[1].map((option) => option.value);
        }
        return option.value;
    });
    const handleSelectedChange = (nextValue: any) => {
        if (optionValues.includes(nextValue)) {
            onSelectedChange(nextValue);
        } else if (allowAddOption) {
            onAddOption?.(nextValue);
            // Note: ideally the state should be managed on the outside if allowAddOption is used
            // onSelectedChange(nextValue);
        }
    };

    const [contentRef, setContentRef] = useState<HTMLDivElement | null>(null);
    useEffect(() => {
        if (contentRef) {
            setTimeout(() => {
                contentRef?.querySelector('[data-selected]')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }, 0);
        }
    }, [contentRef]);

    return (
        <Popover open={isPopoverOpen}>
            <Select
                search={search}
                onSearchChange={setSearch}
                selected={value}
                onSelectedChange={handleSelectedChange}
                open={isPopoverOpen}
                forceMount={!isMounted}
                onOpenChange={handleOpenChange}
                allowAddOption={allowAddOption}
                onAddOption={onAddOption}
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
                                    className="pl-2 py-1.5 pr-0 cursor-default !outline-none text-left"
                                    disabled={selectProps.disabled}
                                    type="button"
                                >
                                    <Select.Value
                                        placeholder={placeholder === undefined ? emptyLabel : placeholder}
                                        className="ui-placeholder:text-neutral-400 ui-placeholder:font-normal min-h-5 text-left"
                                    />
                                </button>
                            </Widget.Content>

                            <Widget.Controls>
                                {value && !hideClear && !selectProps.required ? (
                                    <Widget.ControlButton className="!bg-transparent" onClick={handleClear}>
                                        <XIcon />
                                    </Widget.ControlButton>
                                ) : (
                                    <Widget.ControlButton className="pointer-events-none -ml-2">
                                        <ChevronsUpDownIcon
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
                    className={classnames('p-0 min-w-0 overflow-visible flex flex-col', !isMounted && 'hidden')}
                    onOpenAutoFocus={(e) => {
                        e.preventDefault();
                    }}
                    // @ts-ignore
                    forceMount={!isMounted}
                    align="start"
                    onWheel={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <Select.Content
                        ref={setContentRef}
                        className="flex flex-col flex-1 min-h-0"
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                e.stopPropagation();
                            }
                        }}
                    >
                        <div className={classnames('relative w-full min-w-0 p-2', hideSearch && 'hidden')}>
                            <span className="absolute top-1/2 left-4 transform -translate-y-1/2 text-neutral-400 text-xl">
                                <SearchIcon className="!w-3.5 !h-3.5" />
                            </span>

                            <Widget variant="input" asChild disabled={selectProps.disabled}>
                                <Select.Search
                                    className="rounded px-2 py-1 !pl-7 bg-transparent w-full min-w-0"
                                    placeholder={searchPlaceholder}
                                    ref={searchRef}
                                />
                            </Widget>
                        </div>

                        <div
                            className={classnames(
                                'flex flex-col overflow-auto scrollbar-thin flex-1 min-h-0 p-1.5',
                                !hideSearch && 'pt-0'
                            )}
                        >
                            {allowAddOption && (
                                <MemoSingleSelectOption
                                    index={0}
                                    value={search || ''}
                                    label={search || ''}
                                    disabled={!search}
                                    className={!search ? 'hidden' : ''}
                                    hideCheck={hideCheck}
                                />
                            )}

                            {options.map((option: Option | [string, Option[]], index) => {
                                if (Array.isArray(option)) {
                                    const [label, options] = option;
                                    return (
                                        <React.Fragment key={label}>
                                            {index !== 0 && (
                                                <Select.Separator className="border-t border-neutral-200 my-2" />
                                            )}
                                            <Select.Group className="flex flex-col">
                                                <Select.GroupLabel className="font-medium text-sm px-2 py-1 !pl-7">
                                                    {label}
                                                </Select.GroupLabel>
                                                {options.map((option: Option) => (
                                                    <MemoSingleSelectOption
                                                        key={option.value}
                                                        {...option}
                                                        hideCheck={hideCheck}
                                                    />
                                                ))}
                                            </Select.Group>
                                        </React.Fragment>
                                    );
                                }

                                return <MemoSingleSelectOption key={option.value} {...option} hideCheck={hideCheck} />;
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
