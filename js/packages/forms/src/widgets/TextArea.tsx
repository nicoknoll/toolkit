import * as React from 'react';
import Widget, { useWidgetState, WidgetProps } from './Widget.tsx';
import { classnames } from '@nicoknoll/utils';

export interface TextAreaProps extends React.ComponentPropsWithRef<'textarea'>, WidgetProps {
    inputClassName?: string;
}

const TextArea = ({ inputClassName, className, controls, widgetRef, ref, ...props }: TextAreaProps) => {
    const [value, onChange] = useWidgetState('', props.value, props.onChange);

    return (
        <Widget className={className} readOnly={props.readOnly} disabled={props.disabled} ref={widgetRef}>
            <Widget.Content>
                <textarea
                    ref={ref}
                    className={classnames(
                        'px-2 py-1.5 flex-1 min-w-0 min-h-[4rem] bg-transparent',
                        props.disabled && 'resize-none',
                        inputClassName
                    )}
                    {...props}
                    value={value}
                    onChange={onChange}
                />
            </Widget.Content>

            <Widget.Controls>{controls}</Widget.Controls>
        </Widget>
    );
};

export default TextArea;
