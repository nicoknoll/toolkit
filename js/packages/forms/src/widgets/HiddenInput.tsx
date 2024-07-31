import * as React from 'react';
import { useWidgetState } from './Widget.tsx';

export interface HiddenInputProps extends React.ComponentPropsWithRef<'input'> {}

const HiddenInput = (props: HiddenInputProps) => {
    const [value, onChange] = useWidgetState('', props.value, props.onChange);

    return <input {...props} type="hidden" value={value} onChange={onChange} />;
};

export default HiddenInput;
