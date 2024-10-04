import * as React from 'react';
import { ChangeEventHandler, FormEventHandler, useEffect, useRef, useState } from 'react';
import setNativeInputValue from '../utils/setNativeInputValue.ts';
import { mergeRefs } from '@nicoknoll/utils';

const createShadowInput = ({
    onInput,
    onChange,
    externalRef,
}: {
    onInput?: FormEventHandler<HTMLInputElement>;
    onChange?: ChangeEventHandler<HTMLInputElement>;
    externalRef?: React.RefObject<HTMLInputElement>;
}) => {
    const shadowInput = document.createElement('input');

    if (onInput) shadowInput.addEventListener('input', onInput as any);
    if (onChange) shadowInput.addEventListener('change', onChange as any);
    if (externalRef) shadowInput.addEventListener('focus', (e) => externalRef.current?.focus());

    return shadowInput;
};

interface ShadowInputProps extends React.ComponentPropsWithRef<'input'> {
    format?: (value: string) => string;
    parse?: (value: string) => string;
}

const ShadowInput = ({
    ref,
    value,
    format,
    parse,

    onChange,
    onInput,

    onFocus,
    onBlur,

    ...props
}: ShadowInputProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const shadowRef = useRef<HTMLInputElement>(createShadowInput({ onInput, onChange, externalRef: inputRef }));

    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState<string>(value?.toString() || '');

    // handles controlled and uncontrolled input value
    const getLastValidValue = () =>
        value === undefined && shadowRef.current?.value !== undefined
            ? shadowRef.current?.value
            : value?.toString() || '';

    useEffect(() => {
        // only listen to external value changes when the input is not focused
        if (isFocused) return;

        const lastValidValue = getLastValidValue();
        const parsedValue = (parse ? parse(inputValue) : inputValue) || '';
        if (parsedValue !== lastValidValue) {
            setInputValue((format ? format(lastValidValue) : lastValidValue) || '');
            setNativeInputValue(shadowRef?.current, lastValidValue);
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // triggered when input is typed into
        setInputValue(e.target.value);

        // this value needs to be parsed with the parse function
        const parsedValue = (parse ? parse(e.target.value) : e.target.value) || '';
        if (parsedValue !== shadowRef.current?.value) {
            setNativeInputValue(shadowRef?.current, parsedValue);
        }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        onBlur?.(e);

        if (e.defaultPrevented) return;

        const lastValidValue = getLastValidValue();
        const formattedValue = (format ? format(lastValidValue) : lastValidValue) || '';
        if (formattedValue !== inputValue) {
            setInputValue((format ? format(lastValidValue) : lastValidValue) || '');
            setNativeInputValue(shadowRef.current, lastValidValue);
        }
    };

    return (
        <input
            ref={mergeRefs(ref, inputRef)}
            value={inputValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
        />
    );
};

export default ShadowInput;
