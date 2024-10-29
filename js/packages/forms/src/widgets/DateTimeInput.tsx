import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import Widget, { useWidgetState, WidgetProps } from './Widget.tsx';
import Popover from '../misc/Popover.tsx';
import { ChevronDownIcon, ClockIcon, XIcon } from 'lucide-react';
import Calendar from './Calendar.tsx';
import * as chrono from 'chrono-node';
import { classnames, mergeRefs } from '@nicoknoll/utils';
import setNativeInputValue from '../utils/setNativeInputValue.ts';
import { DateFieldProps } from './DateInput.tsx';
import TimeInput from './TimeInput.tsx';
import Button from '../misc/Button.tsx';

// Function to parse a date string into a Date object
const parseDate = (str: Date | string): Date | null => {
    // "some date" -> Date
    if (str instanceof Date) return str;
    return chrono.de.parseDate(str);
};

const formatDate = (date: Date | string): string => {
    // Date -> YYYY-MM-DDTHH:MM:SS
    if (date?.toString() === 'Invalid Date' || date === '') return '';
    return new Date(date).toISOString();
};

const displayDate = (date: Date | string): string => {
    // Date -> DD.MM.YYYY, HH:MM
    if (date?.toString() === 'Invalid Date' || date === '') return '';

    return new Date(date).toLocaleDateString('de-DE', {
        // zero padded
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};

const DateTimeInput = ({
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
    const timeRef = useRef<HTMLInputElement>(null);

    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const handlePopoverOpenChange = (open: boolean) => {
        if (disabled) return;

        setIsPopoverOpen(open);
    };

    const [value, onChange] = useWidgetState('', props.value, props.onChange);

    const handleClear = (e: React.MouseEvent) => {
        setNativeInputValue(nativeRef.current!, '');
        // keep popover closed
        e.preventDefault();
        e.stopPropagation();
    };

    const parsedDate = value ? parseDate(value) || undefined : undefined;

    const [month, setMonth] = useState<Date>(parsedDate || new Date());
    useEffect(() => {
        if (parsedDate) {
            setMonth(parsedDate);
        }
    }, [value]);

    const handleDateSelect = (date: Date | null) => {
        if (date && parsedDate) {
            date.setHours(parsedDate.getHours());
            date.setMinutes(parsedDate.getMinutes());
            date.setSeconds(parsedDate.getSeconds());
        }

        if (nativeRef.current) {
            setNativeInputValue(nativeRef.current, date ? formatDate(date) : '');
        }

        if (date) {
            timeRef.current?.focus();
        }
    };

    const handleTimeChange = (e: any) => {
        const newDate = value ? new Date(value) : new Date();
        const [hour, minute, second] = e.target.value.split(':');

        newDate.setHours(parseInt(hour));
        newDate.setMinutes(parseInt(minute));
        newDate.setSeconds(parseInt(second));

        if (nativeRef.current) {
            setNativeInputValue(nativeRef.current, newDate ? formatDate(newDate) : '');
        }
    };

    const handleClockButtonClick = () => {
        const newDate = value ? new Date(value) : new Date();
        const now = new Date();

        newDate.setHours(now.getHours());
        newDate.setMinutes(now.getMinutes());
        newDate.setSeconds(now.getSeconds());

        if (nativeRef.current) {
            setNativeInputValue(nativeRef.current, newDate ? formatDate(newDate) : '');
        }
    };

    const timeValue = value
        ? new Date(value).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : '';

    return (
        <div className="relative">
            <Popover open={isPopoverOpen} onOpenChange={handlePopoverOpenChange} modal={isPopoverOpen}>
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
                                className="px-2 py-1.5 pr-0 cursor-default !outline-none"
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
                    className="w-auto min-w-min flex flex-col gap-4"
                    onOpenAutoFocus={(e) => {
                        e.preventDefault();
                    }}
                    align="start"
                    ref={popoverRef}
                >
                    <Calendar
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

                    <div className="flex items-stretch justify-center gap-1 bg-neutral-50 p-3 rounded">
                        <Button variant="ghost" onClick={handleClockButtonClick} className="px-2 !text-theme-500">
                            <ClockIcon />
                        </Button>

                        <TimeInput
                            value={timeValue}
                            onChange={handleTimeChange}
                            name="time"
                            ref={timeRef}
                            className="w-48 px-1.5"
                        />
                    </div>
                </Popover.Content>
            </Popover>

            <Widget.Native>
                <input
                    ref={mergeRefs(ref, nativeRef)}
                    {...props}
                    value={value}
                    onChange={onChange}
                    tabIndex={-1}
                    // onFocus={() => triggerRef.current?.focus()}
                    disabled={disabled}
                    required={required}
                />
            </Widget.Native>
        </div>
    );
};

export default DateTimeInput;
