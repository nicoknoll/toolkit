import * as React from 'react';
import { useEffect } from 'react';
import { CheckIcon, MinusIcon } from 'lucide-react';
import { classnames } from '@nicoknoll/utils';
import Widget, { useWidgetState } from './Widget.tsx';
import { mergeRefs } from '@nicoknoll/utils';

export interface CheckboxProps extends React.ComponentPropsWithRef<'input'> {
    indeterminate?: boolean;
}

const Checkbox = ({ className, indeterminate, ...props }: CheckboxProps) => {
    const checkboxRef = React.useRef<HTMLInputElement>(null);

    const [checked, onChange] = useWidgetState(false, props.checked, props.onChange);

    useEffect(() => {
        // can only be controlled via js
        if (checkboxRef.current) checkboxRef.current.indeterminate = !!indeterminate;
    }, [indeterminate]);

    return (
        <Widget
            variant="checkable"
            disabled={props.disabled}
            checked={checked}
            className={classnames('relative flex items-center justify-center w-5 h-5 rounded', className)}
        >
            <Widget.Native asChild variant="inset">
                <input
                    {...props}
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    ref={mergeRefs(checkboxRef, props.ref)}
                />
            </Widget.Native>

            <Widget.Content className="text-white justify-center items-center">
                {indeterminate ? <MinusIcon /> : checked && <CheckIcon />}
            </Widget.Content>
        </Widget>
    );
};

export default Checkbox;
