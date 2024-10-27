import isMultipleSelect from './isMultipleSelect.ts';

const setNativeInputValue = (input: HTMLInputElement, value: string) => {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    nativeInputValueSetter?.call(input, value);

    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
};

export const setNativeSelectValue = (select: HTMLSelectElement, value: string | string[]) => {
    const options = Array.from(select.options);

    if (Array.isArray(value)) {
        options.forEach((option) => {
            option.selected = value.includes(option.value);
        });
    } else {
        options.forEach((option) => {
            option.selected = option.value === value;
        });
    }

    select.dispatchEvent(new Event('input', { bubbles: true }));
    select.dispatchEvent(new Event('change', { bubbles: true }));
};

export const getNativeSelectValue = (select: HTMLSelectElement) => {
    if (isMultipleSelect(select)) {
        return Array.from(select.selectedOptions).map((option) => option.value);
    } else {
        return (select as HTMLSelectElement).value;
    }
};

export const setNativeTextareaValue = (textarea: HTMLTextAreaElement, value: string) => {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
    nativeInputValueSetter?.call(textarea, value);

    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
};

export default setNativeInputValue;
