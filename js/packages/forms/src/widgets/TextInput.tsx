import * as React from 'react';
import Widget, { useWidgetState, WidgetProps } from './Widget.tsx';
import { classnames } from '@nicoknoll/utils';
import { XIcon } from 'lucide-react';
import { mergeRefs } from '@nicoknoll/utils';
import setNativeInputValue from '../utils/setNativeInputValue.ts';

export interface TextInputProps extends React.ComponentPropsWithRef<'input'> {
    hideClear?: boolean;
    inputClassName?: string;
}

const TextInput = ({
    className,
    inputClassName,
    hideClear = false,
    controls,
    widgetRef,
    ref,
    ...props
}: TextInputProps & WidgetProps) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [value, onChange] = useWidgetState('', props.value, props.onChange);

    const handleClear = () => {
        setNativeInputValue(inputRef.current!, '');
        inputRef.current?.focus();
    };

    return (
        <Widget className={className} readOnly={props.readOnly} disabled={props.disabled} ref={widgetRef}>
            <Widget.Content>
                <input
                    ref={mergeRefs(inputRef, ref)}
                    className={classnames(
                        'px-2 py-1.5 flex-1 min-w-0 bg-transparent placeholder:text-neutral-400',
                        inputClassName
                    )}
                    {...props}
                    value={value}
                    onChange={onChange}
                />
            </Widget.Content>

            <Widget.Controls>
                {controls}

                {value && !hideClear && (
                    <Widget.ControlButton onClick={handleClear}>
                        <XIcon />
                    </Widget.ControlButton>
                )}
            </Widget.Controls>
        </Widget>
    );
};

export default TextInput;
