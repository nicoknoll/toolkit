import { FieldProps, SimpleField } from './Field.tsx';
import React from 'react';
import FileInput from '../widgets/FileInput.tsx';

const FileField = (props: FieldProps<string> & React.ComponentPropsWithRef<typeof FileInput>) => (
    <SimpleField widget={FileInput} {...props} />
);

export default FileField;
