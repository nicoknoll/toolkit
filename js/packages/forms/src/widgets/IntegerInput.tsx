import * as React from 'react';
import { WidgetProps } from './Widget.tsx';
import DecimalInput from './DecimalInput.tsx';

export interface IntegerInputProps extends React.ComponentPropsWithRef<'input'> {
    hideClear?: boolean;
    inputClassName?: string;
}

const IntegerInput = (props: IntegerInputProps & WidgetProps) => {
    return <DecimalInput {...props} decimalPlaces={0} />;
};

export default IntegerInput;
