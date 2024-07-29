import * as React from 'react';
import { useWidgetState, WidgetProps } from './Widget.tsx';
import TextInput, { TextInputProps } from './TextInput.tsx';

const IntegerInput = (props: TextInputProps & WidgetProps) => {
    const [value, onChange] = useWidgetState('', props.value, props.onChange);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (!/^\d*$/.test(value)) return;
        onChange(e);
    };

    return <TextInput {...props} value={value} onChange={handleChange} />;
};

export default IntegerInput;
