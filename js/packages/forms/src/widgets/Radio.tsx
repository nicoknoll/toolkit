import React from 'react';
import { classnames } from '@nicoknoll/utils';
import Widget, { useWidgetState } from './Widget.tsx';

interface RadioProps extends React.ComponentPropsWithRef<'input'> {}

const Radio = ({ disabled, className, ...props }: RadioProps) => {
    const [checked, onChange] = useWidgetState(false, props.checked, props.onChange);

    return (
        <Widget
            variant="checkable"
            checked={checked}
            disabled={disabled}
            className={classnames('relative flex items-center justify-center w-5 h-5 rounded-full', className)}
        >
            <Widget.Native asChild variant="inset">
                <input
                    {...props}
                    disabled={disabled}
                    type="radio"
                    className="peer"
                    checked={checked}
                    onChange={onChange}
                />
            </Widget.Native>

            <Widget.Content className="hidden peer-checked:flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            </Widget.Content>
        </Widget>
    );
};

export default Radio;
