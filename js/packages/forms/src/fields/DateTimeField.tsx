import { FieldProps, SimpleField } from './Field.tsx';
import React from 'react';
import DateTimeInput from '../widgets/DateTimeInput.tsx';

const DateTimeField = (props: FieldProps<string> & React.ComponentPropsWithRef<typeof DateTimeInput>) => (
    <SimpleField widget={DateTimeInput} {...props} />
);

export default DateTimeField;
