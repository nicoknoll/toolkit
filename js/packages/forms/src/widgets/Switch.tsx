import { classnames } from '@nicoknoll/utils';
import * as React from 'react';
import Widget, { useWidgetState } from './Widget.tsx';

export interface SwitchProps extends React.ComponentPropsWithRef<'input'> {}

const Switch = ({ className, disabled, defaultChecked = false, ...props }: SwitchProps) => {
    const [checked, onChange] = useWidgetState(false, props.checked, props.onChange);

    return (
        <Widget
            variant="checkable"
            checked={checked}
            disabled={disabled}
            className={classnames(
                'relative flex items-center w-10 h-6 rounded-full',
                !disabled && !checked && 'bg-neutral-50',
                className
            )}
        >
            <Widget.Native asChild variant="inset">
                <input {...props} disabled={disabled} type="checkbox" checked={checked} onChange={onChange} />
            </Widget.Native>

            <Widget.Content>
                <span
                    className={classnames(
                        'bg-white transform transition-all duration-300 ease-in-out inline-block w-5 h-5 rounded-full border shadow-sm pointer-events-none',
                        checked ? 'translate-x-[1.125rem] border-theme-900' : 'translate-x-px border-neutral-300',
                        disabled && 'shadow-none',
                        disabled && checked && 'border-neutral-400'
                    )}
                />
            </Widget.Content>
        </Widget>
    );
};

export default Switch;
