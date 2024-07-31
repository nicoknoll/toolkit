import { FieldProps, SimpleField } from './Field.tsx';
import IntegerInput from '../widgets/IntegerInput.tsx';
import React from 'react';

const IntegerField = (props: FieldProps<number> & React.ComponentPropsWithRef<typeof IntegerInput>) => (
    <SimpleField widget={IntegerInput} {...props} />
);

export default IntegerField;
