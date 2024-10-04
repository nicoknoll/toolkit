import { FieldProps, SimpleField } from './Field.tsx';
import React from 'react';
import FileInput, { InputFile } from '../widgets/FileInput.tsx';

const FileField = (props: FieldProps<InputFile[]> & React.ComponentPropsWithRef<typeof FileInput>) => (
    <SimpleField widget={FileInput} {...props} />
);

export default FileField;
