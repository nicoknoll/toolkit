import { FieldProps, SimpleField } from './Field.tsx';
import HiddenInput from '../widgets/HiddenInput.tsx';
import React from 'react';

const HiddenField = (props: FieldProps<string> & React.ComponentPropsWithRef<typeof HiddenInput>) => (
    <SimpleField widget={HiddenInput} {...props} />
);

export default HiddenField;
