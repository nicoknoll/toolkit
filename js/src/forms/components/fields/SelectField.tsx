import { FieldProps, SimpleField } from './Field.tsx';
import SingleSelect from '../widgets/SingleSelect.tsx';
import React from 'react';

const SelectField = (props: FieldProps<string> & React.ComponentPropsWithRef<typeof SingleSelect>) => {
    return <SimpleField widget={SingleSelect} {...props} />;
};

export default SelectField;
