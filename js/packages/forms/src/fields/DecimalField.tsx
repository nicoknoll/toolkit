import { FieldProps, SimpleField } from './Field.tsx';
import DecimalInput from '../widgets/DecimalInput.tsx';
import React from 'react';

const DecimalField = (props: FieldProps<number> & React.ComponentPropsWithRef<typeof DecimalInput>) => (
    <SimpleField widget={DecimalInput} {...props} />
);

export default DecimalField;
