import { FieldProps, SimpleField } from './Field.tsx';
import DateInput from '../widgets/DateInput.tsx';
import React from 'react';

const DateField = (props: FieldProps<string> & React.ComponentPropsWithRef<typeof DateInput>) => (
    <SimpleField widget={DateInput} {...props} />
);

export default DateField;
