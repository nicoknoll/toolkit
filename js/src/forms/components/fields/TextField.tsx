import { FieldProps, SimpleField } from './Field.tsx';
import React from 'react';
import TextArea from '../widgets/TextArea.tsx';

const TextField = (props: FieldProps<string> & React.ComponentPropsWithRef<typeof TextArea>) => (
    <SimpleField widget={TextArea} {...props} />
);

export default TextField;
