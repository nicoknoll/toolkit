import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import Widget, { useWidgetState, WidgetProps } from './Widget.tsx';
import Popover from '../Popover.tsx';
import { ChevronDownIcon, XIcon } from 'lucide-react';
import Calendar from './Calendar.tsx';
import * as chrono from 'chrono-node';
import mergeRefs from '../../../../utils/mergeRefs.ts';
import setNativeInputValue from '../../../../utils/setNativeInputValue.ts';
import Button from '../Button.tsx';
import { classnames } from '../../../../utils/classnames.ts';
import TextInput from './TextInput.tsx';

// Function to parse a date string into a Date object
const parseDate = (str: Date | string): Date | null => {
    // "some date" -> Date
    if (str instanceof Date) return str;
    return chrono.de.parseDate(str);
};

const formatDate = (date: Date | string): string => {
    // Date -> YYYY-MM-DD
    if (date?.toString() === 'Invalid Date' || date === '') return '';

    const tzOffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
    const localISOTime = new Date(new Date(date).getTime() - tzOffset).toISOString().slice(0, -1);

    return localISOTime?.split('T')?.[0] || '';
};

const displayDate = (date: Date | string): string => {
    // Date -> DD.MM.YYYY
    if (date?.toString() === 'Invalid Date' || date === '') return '';

    return new Date(date).toLocaleDateString('de-DE', {
        // zero padded
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
    });
};

export interface DateFieldProps extends React.ComponentPropsWithRef<'input'> {
    defaultValue?: string;
    value?: string;
    calendarProps?: React.ComponentPropsWithRef<typeof Calendar>;

    emptyButtonLabel?: string;
    searchPlaceholder?: string;

    hideClear?: boolean;
}

const DateInput = ({
    ref,
    controls,
    className,
    calendarProps,
    placeholder,
    emptyButtonLabel,
    searchPlaceholder,
    hideClear,
    disabled,
    required,
    ...props
}: DateFieldProps & WidgetProps) => {
    const nativeRef = useRef<HTMLInputElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const handlePopoverOpenChange = (open: boolean) => {
        if (disabled) return;

        setIsPopoverOpen(open);
        setInputValue('');
    };

    const [value, onChange] = useWidgetState('', props.value, props.onChange);

    const handleClear = (e: React.MouseEvent) => {
        setNativeInputValue(nativeRef.current!, '');
        // keep popover closed
        e.preventDefault();
        e.stopPropagation();
    };

    /* Input field */

    const [inputValue, setInputValue] = useState<string | undefined>(value);
    const parsedInputDate = inputValue ? parseDate(inputValue) || undefined : undefined;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleButtonClick = () => {
        if (nativeRef.current) {
            setNativeInputValue(nativeRef.current, formatDate(parsedInputDate || ''));
            setIsPopoverOpen(false);
        }
    };

    /* Calendar */

    const parsedDate = value ? parseDate(value) || undefined : undefined;

    const [month, setMonth] = useState<Date>(parsedDate || new Date());
    useEffect(() => {
        if (parsedDate) setMonth(parsedDate);
    }, [value]);
    useEffect(() => {
        if (parsedInputDate) setMonth(parsedInputDate);
    }, [inputValue]);

    const handleDateSelect = (date: Date | null) => {
        if (nativeRef.current) {
            setNativeInputValue(nativeRef.current, date ? formatDate(date) : '');
            setIsPopoverOpen(false);
        }
    };

    const modifiers = {
        highlighted:
            parsedInputDate && formatDate(parsedInputDate) !== (parsedDate && formatDate(parsedDate))
                ? [parsedInputDate]
                : [],
    };

    const modifiersClassNames = {
        highlighted: '!bg-theme-100',
    };

    /* ------------------- */

    return (
        <div className="relative">
            <Popover open={isPopoverOpen} onOpenChange={handlePopoverOpenChange}>
                <Popover.Trigger asChild>
                    <Widget
                        variant="button"
                        disabled={disabled}
                        className={classnames('flex gap-1 justify-between w-full group rounded', className)}
                    >
                        <Widget.Content
                            className="ui-placeholder:text-neutral-400 ui-placeholder:font-normal"
                            data-placeholder={!value ? '' : undefined}
                            asChild
                        >
                            <button
                                ref={triggerRef}
                                className="px-2 py-1.5 pr-0 cursor-default"
                                disabled={disabled}
                                type="button"
                            >
                                <span className="min-h-5 block min-w-16">
                                    {value ? displayDate(value) : placeholder}
                                </span>
                            </button>
                        </Widget.Content>

                        <Widget.Controls>
                            {value && !hideClear ? (
                                <Widget.ControlButton className="!bg-transparent" onClick={handleClear}>
                                    <XIcon />
                                </Widget.ControlButton>
                            ) : (
                                <Widget.ControlButton className="pointer-events-none">
                                    <ChevronDownIcon
                                        className={classnames(
                                            'text-neutral-400 transition-colors',
                                            !disabled && 'group-hover:text-neutral-700'
                                        )}
                                    />
                                </Widget.ControlButton>
                            )}
                            {controls}
                        </Widget.Controls>
                    </Widget>
                </Popover.Trigger>

                <Popover.Content
                    className="w-auto p-4 min-w-min flex flex-col gap-4"
                    onOpenAutoFocus={(e) => {
                        e.preventDefault();
                    }}
                    align="start"
                    ref={popoverRef}
                >
                    <TextInput
                        autoFocus
                        inputClassName="px-2 py-1"
                        placeholder={searchPlaceholder}
                        value={inputValue}
                        onChange={handleInputChange}
                    />

                    <Button type="button" disabled={!parsedInputDate} onClick={handleButtonClick} className="py-1">
                        <span className="min-h-5 block">
                            {parsedInputDate ? displayDate(parsedInputDate) : emptyButtonLabel}
                        </span>
                    </Button>

                    <hr className="border-neutral-200" />

                    <Calendar
                        modifiers={modifiers}
                        modifiersClassNames={modifiersClassNames}
                        className="p-0"
                        mode="single"
                        month={month}
                        onMonthChange={(date) => setMonth(date)}
                        selected={parsedDate}
                        // @ts-ignore
                        onSelect={handleDateSelect}
                        fixedWeeks
                        showOutsideDays
                        {...calendarProps}
                    />
                </Popover.Content>
            </Popover>

            <Widget.Native>
                <input
                    ref={mergeRefs(ref, nativeRef)}
                    type="date"
                    {...props}
                    value={value}
                    onChange={onChange}
                    tabIndex={-1}
                    onFocus={() => triggerRef.current?.focus()}
                    disabled={disabled}
                    required={required}
                />
            </Widget.Native>
        </div>
    );
};

export default DateInput;
