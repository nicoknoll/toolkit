import React from 'react';
import { Option } from './Select.tsx';
import { SingleSelectProps } from './SingleSelect.tsx';
import { classnames } from '@nicoknoll/utils';
import Widget, { useWidgetState } from './Widget.tsx';

const ToggleButton = ({
    options,
    name,
    className,

    disabled,
    required,

    ...props
}: SingleSelectProps & { options: Option[]; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
    const [value, onChange] = useWidgetState('', props.value, props.onChange);

    return (
        <div className={classnames('flex gap-1 bg-neutral-100 p-1 rounded-md', className)}>
            {options.map((option: Option) => {
                const active = value === option.value;
                return (
                    <Widget
                        key={option.value}
                        variant="checkable"
                        checked={active}
                        disabled={disabled}
                        className={classnames(
                            'relative flex-auto text-center text-sm py-1 px-2 font-normal rounded',
                            !active && 'bg-transparent border-transparent shadow-none',
                            !disabled && 'hover:border-neutral-300'
                        )}
                    >
                        <Widget.Native asChild variant="inset">
                            <input
                                disabled={disabled}
                                type="radio"
                                checked={active}
                                onChange={onChange}
                                name={name}
                                required={required}
                                value={option.value}
                            />
                        </Widget.Native>

                        <Widget.Content
                            className={classnames(
                                'pointer-events-none select-none justify-center items-center text-center',
                                active && 'text-white'
                            )}
                        >
                            {option.label}
                        </Widget.Content>
                    </Widget>
                );
            })}
        </div>
    );
};

export default ToggleButton;
