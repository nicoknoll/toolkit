import { FieldProps, SimpleField } from './Field.tsx';
import MultiSelect from '../widgets/MultiSelect.tsx';
import React from 'react';

const MultiSelectField = (props: FieldProps<string[]> & React.ComponentPropsWithRef<typeof MultiSelect>) => {
    return <SimpleField widget={MultiSelect} {...props} />;
};

export default MultiSelectField;
