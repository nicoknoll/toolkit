import { classnames, mergeRefs } from '@nicoknoll/utils';
import React, { useState } from 'react';
import setNativeInputValue from '../utils/setNativeInputValue.ts';
import IntegerInput from './IntegerInput.tsx';
import Widget, { useWidgetState } from './Widget.tsx';

interface MemorableDateProps extends React.ComponentPropsWithRef<'input'> {}

const isDate = (date: string) => String(new Date(date)) !== 'Invalid Date';

const MemorableDateInput = ({ ref, className, disabled, readOnly, required, name, ...props }: MemorableDateProps) => {
    const nativeRef = React.useRef<HTMLInputElement>(null);

    const dayRef = React.useRef<HTMLInputElement>(null);
    const monthRef = React.useRef<HTMLInputElement>(null);
    const yearRef = React.useRef<HTMLInputElement>(null);

    const [value, onChange] = useWidgetState('', props.value, props.onChange);

    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');

    const getDateString = (name: string, value: string) => {
        let dateString = '';
        if (name === 'day' && value && month && year) {
            dateString = `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${value.padStart(2, '0')}`;
        } else if (name === 'month' && day && value && year) {
            dateString = `${year.padStart(4, '0')}-${value.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else if (name === 'year' && day && month && value) {
            dateString = `${value.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        return dateString;
    };

    const focusAndSelect = (
        ref: React.RefObject<HTMLInputElement>,
        selectionRange: 'start' | 'end' | 'all' = 'start'
    ) => {
        ref.current?.focus();
        ref.current?.setSelectionRange(
            // handle start, end and all
            selectionRange === 'start' || selectionRange === 'all' ? 0 : ref.current.value.length,
            selectionRange === 'end' || selectionRange === 'all' ? ref.current.value.length : 0
        );
    };

    const getHandleChange =
        (name: string, prevValue: string, setValue: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;

            // only numbers
            if (!/^\d*$/.test(value)) return;

            if (name === 'day' && value.length > 2) return;
            if (name === 'month' && value.length > 2) return;
            if (name === 'year' && value.length > 4) return;

            setValue(value);

            const isDayValid = name === 'day' && value.length === 2 && parseInt(value) <= 31 && parseInt(value) >= 1;
            const isMonthValid =
                name === 'month' && value.length === 2 && parseInt(value) <= 12 && parseInt(value) >= 1;

            if (name === 'day' && isDayValid) {
                focusAndSelect(monthRef, 'all');
            } else if (name === 'month' && isMonthValid) {
                focusAndSelect(yearRef, 'all');
            }

            const dateString = getDateString(name, value);
            setNativeInputValue(nativeRef.current!, isDate(dateString) ? dateString : '');
        };

    const getHandleKeyDown =
        (name: string, prevValue: string, setValue: any) => (e: React.KeyboardEvent<HTMLInputElement>) => {
            const valueLength = e.currentTarget.value.length;
            const isCaretAtStart = e.currentTarget.selectionStart === 0;
            const isCaretAtEnd = e.currentTarget.selectionStart === valueLength;

            if (e.key === 'Backspace') {
                if (prevValue !== '') {
                    return;
                } else if (name === 'month') {
                    e.preventDefault();
                    focusAndSelect(dayRef, 'end');
                } else if (name === 'year') {
                    e.preventDefault();
                    focusAndSelect(monthRef, 'end');
                }
            } else if (e.key === 'ArrowLeft' && isCaretAtStart) {
                if (name === 'month') {
                    e.preventDefault();
                    focusAndSelect(dayRef, 'end');
                } else if (name === 'year') {
                    e.preventDefault();
                    focusAndSelect(monthRef, 'end');
                }
            } else if (e.key === 'ArrowRight' && isCaretAtEnd) {
                if (name === 'day') {
                    e.preventDefault();
                    focusAndSelect(monthRef);
                } else if (name === 'month') {
                    e.preventDefault();
                    focusAndSelect(yearRef);
                }
            }
        };

    const getBlurHandler =
        (name: string, prevValue: string, setValue: any) => (e: React.FocusEvent<HTMLInputElement>) => {
            const value = e.target.value;

            const isSiblingFocused =
                e.relatedTarget === dayRef.current ||
                e.relatedTarget === monthRef.current ||
                e.relatedTarget === yearRef.current;

            if (!isSiblingFocused && nativeRef.current?.value === '') {
                setDay('');
                setMonth('');
                setYear('');
            }

            if ((name === 'day' || name === 'month') && value.length > 0 && value.length < 2) {
                setValue(value.padStart(2, '0'));
            } else if (name === 'year' && value.length > 0 && value.length < 4) {
                setValue(value.padStart(4, '0'));
            }
        };

    const getFieldProps = (name: string, value: string, setValue: any) => ({
        value,
        onChange: getHandleChange(name, value, setValue),
        onKeyDown: getHandleKeyDown(name, value, setValue),
        onBlur: getBlurHandler(name, value, setValue),
        disabled,
        readOnly,
        required,
    });

    return (
        <div className="flex gap-2 relative">
            <IntegerInput
                ref={dayRef}
                className={classnames('w-11', className)}
                inputClassName="text-center"
                minLength={1}
                maxLength={2}
                min={1}
                max={31}
                name={`${name}-day`}
                placeholder="DD"
                hideClear
                // type="number"
                {...getFieldProps('day', day, setDay)}
            />

            <IntegerInput
                ref={monthRef}
                className={classnames('w-11', className)}
                inputClassName="text-center"
                minLength={1}
                maxLength={2}
                min={1}
                max={12}
                name={`${name}-month`}
                placeholder="MM"
                tabIndex={-1}
                hideClear
                // type="number"
                {...getFieldProps('month', month, setMonth)}
            />

            <IntegerInput
                ref={yearRef}
                className={classnames('w-16', className)}
                inputClassName="text-center"
                minLength={4}
                maxLength={4}
                name={`${name}-year`}
                placeholder="YYYY"
                tabIndex={-1}
                hideClear
                // type="number"
                {...getFieldProps('year', year, setYear)}
            />

            <Widget.Native asChild>
                <input
                    {...props}
                    value={value}
                    onChange={onChange}
                    ref={mergeRefs(nativeRef, ref)}
                    required={required}
                    name={name}
                    readOnly={readOnly}
                    tabIndex={-1}
                    onFocus={() => dayRef.current?.focus()}
                />
            </Widget.Native>
        </div>
    );
};

export default MemorableDateInput;
