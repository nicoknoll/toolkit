import { classnames, mergeRefs } from '@nicoknoll/utils';
import React, { useEffect, useState } from 'react';
import setNativeInputValue from '../utils/setNativeInputValue.ts';
import IntegerInput from './IntegerInput.tsx';
import Widget, { useWidgetState } from './Widget.tsx';

interface TimeInputProps extends React.ComponentPropsWithRef<'input'> {
    hideSeconds?: boolean;
    inputClassName?: string;
}

const TimeInput = ({
    ref,
    className,
    inputClassName,
    disabled,
    readOnly,
    required,
    name,
    hideSeconds,
    ...props
}: TimeInputProps) => {
    const nativeRef = React.useRef<HTMLInputElement>(null);

    const hoursRef = React.useRef<HTMLInputElement>(null);
    const minutesRef = React.useRef<HTMLInputElement>(null);
    const secondsRef = React.useRef<HTMLInputElement>(null);

    const [value, onChange] = useWidgetState('', props.value, props.onChange);

    const [hours, setHours] = useState('00');
    const [minutes, setMinutes] = useState('00');
    const [seconds, setSeconds] = useState('00');

    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (value && !isFocused) {
            const [hours, minutes, seconds] = value.toString().split(':');

            // display value
            setHours(hours || '00');
            setMinutes(minutes || '00');
            setSeconds(seconds || '00');
        }
    }, [value, isFocused]);

    const getTimeString = (name: string, value: string) => {
        let timeString = '';
        const secondsValue = hideSeconds ? '00' : name == 'seconds' ? value : seconds;
        if (name === 'hours' && value && minutes && secondsValue) {
            timeString = `${value.padStart(2, '0')}:${minutes.padStart(2, '0')}:${secondsValue.padStart(2, '0')}`;
        } else if (name === 'minutes' && hours && value && secondsValue) {
            timeString = `${hours.padStart(2, '0')}:${value.padStart(2, '0')}:${secondsValue.padStart(2, '0')}`;
        } else if (name === 'seconds' && hours && minutes && value) {
            timeString = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${secondsValue.padStart(2, '0')}`;
        }
        return timeString;
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        e.target.select();
    };

    const getHandleChange =
        (name: string, prevValue: string, setValue: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;

            // only numbers
            if (!/^\d*$/.test(value)) return;

            if (name === 'hours' && value.length > 2) return;
            if (name === 'minutes' && value.length > 2) return;
            if (name === 'seconds' && value.length > 2) return;

            // only update display value not the real one
            setValue(value);

            // in case fields are already valid we can jump to the next
            const isHoursValid =
                name === 'hours' && value.length === 2 && parseInt(value) <= 23 && parseInt(value) >= 0;
            const isMinutesValid =
                name === 'minutes' && value.length === 2 && parseInt(value) <= 59 && parseInt(value) >= 0;
            const isSecondsValid =
                name === 'seconds' && value.length === 2 && parseInt(value) <= 59 && parseInt(value) >= 0;

            if (name === 'hours' && isHoursValid) {
                minutesRef.current?.focus();
            } else if (name === 'minutes' && isMinutesValid && !hideSeconds) {
                secondsRef.current?.focus();
            }

            if (isHoursValid || isMinutesValid || isSecondsValid) {
                const timeString = getTimeString(name, value);
                setNativeInputValue(nativeRef.current!, timeString ? timeString : '');
            }
        };

    const getHandleKeyDown =
        (name: string, prevValue: string, setValue: any) => (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Backspace') {
                if (prevValue !== '') {
                    return;
                } else if (name === 'minutes') {
                    e.preventDefault();
                    hoursRef.current?.focus();
                } else if (name === 'seconds') {
                    e.preventDefault();
                    minutesRef.current?.focus();
                }
            } else if (e.key === 'ArrowLeft') {
                if (name === 'minutes') {
                    e.preventDefault();
                    hoursRef.current?.focus();
                } else if (name === 'seconds') {
                    e.preventDefault();
                    minutesRef.current?.focus();
                }
            } else if (e.key === 'ArrowRight') {
                if (name === 'hours') {
                    e.preventDefault();
                    minutesRef.current?.focus();
                } else if (name === 'minutes' && !hideSeconds) {
                    e.preventDefault();
                    secondsRef.current?.focus();
                }
            }
        };

    const getBlurHandler =
        (name: string, prevValue: string, setValue: any) => (e: React.FocusEvent<HTMLInputElement>) => {
            const value = e.target.value;

            const isSiblingFocused =
                e.relatedTarget === hoursRef.current ||
                e.relatedTarget === minutesRef.current ||
                e.relatedTarget === secondsRef.current;

            if (value.length > 0 && value.length < 2) {
                setValue(value.padStart(2, '0'));
                const timeString = getTimeString(name, value.padStart(2, '0'));
                setNativeInputValue(nativeRef.current!, timeString ? timeString : '');
            }

            if (!isSiblingFocused) {
                if (nativeRef.current?.value === '') {
                    setHours('00');
                    setMinutes('00');
                    setSeconds('00');
                }

                setIsFocused(false);
                nativeRef.current?.blur();
            }
        };

    const getFieldProps = (name: string, value: string, setValue: any) => ({
        value,
        onChange: getHandleChange(name, value, setValue),
        onKeyDown: getHandleKeyDown(name, value, setValue),
        onBlur: getBlurHandler(name, value, setValue),
        onFocus: handleFocus,
        readOnly,
        required,
    });

    return (
        <div className={classnames('flex gap-2 items-center relative min-w-0', className)}>
            <IntegerInput
                ref={hoursRef}
                className={classnames('flex-1 min-w-0', inputClassName)}
                inputClassName="text-center"
                minLength={1}
                maxLength={2}
                min={0}
                max={23}
                name={`${name}-hours`}
                placeholder="HH"
                hideClear
                // type="number"
                {...getFieldProps('hours', hours, setHours)}
            />

            <span>:</span>

            <IntegerInput
                ref={minutesRef}
                className={classnames('flex-1 min-w-0', inputClassName)}
                inputClassName="text-center"
                minLength={1}
                maxLength={2}
                min={0}
                max={59}
                name={`${name}-minutes`}
                placeholder="MM"
                tabIndex={-1}
                hideClear
                // type="number"
                {...getFieldProps('minutes', minutes, setMinutes)}
            />

            {!hideSeconds && (
                <>
                    <span>:</span>

                    <IntegerInput
                        ref={secondsRef}
                        className={classnames('flex-1 min-w-0', inputClassName)}
                        inputClassName="text-center"
                        minLength={1}
                        maxLength={2}
                        min={0}
                        max={59}
                        name={`${name}-seconds`}
                        placeholder="SS"
                        tabIndex={-1}
                        hideClear
                        // type="number"
                        {...getFieldProps('seconds', seconds, setSeconds)}
                    />
                </>
            )}

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
                    onFocus={() => hoursRef.current?.focus()}
                />
            </Widget.Native>
        </div>
    );
};

export default TimeInput;
