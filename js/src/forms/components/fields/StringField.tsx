import TextInput from '../widgets/TextInput.tsx';
import { FieldProps, SimpleField } from './Field.tsx';
import React from 'react';

const StringField = (props: FieldProps<string> & React.ComponentPropsWithRef<typeof TextInput>) => (
    <SimpleField widget={TextInput} {...props} />
);

export default StringField;
