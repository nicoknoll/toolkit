import * as React from 'react';
import { useContext } from 'react';
import { classnames } from '@nicoknoll/utils';
import { ButtonProps } from '../misc/Button.tsx';
import { Slot } from '@radix-ui/react-slot';
import { Slottable } from './Select.tsx';
import { useControllableState } from '@nicoknoll/utils';
import isMultipleSelect from '../utils/isMultipleSelect.ts';
import { FieldElement } from 'react-hook-form';

export interface WidgetProps {
    controls?: React.ReactNode;
    widgetRef?: (node: any) => void;
}

interface WidgetContextValue {
    disabled?: boolean;
}

const WidgetContext = React.createContext<WidgetContextValue>({});

/* -------------------------------------------------------------------------------------------------
 * Widget Root
 * -----------------------------------------------------------------------------------------------*/

interface WidgetRootProps extends React.ComponentPropsWithRef<'div'> {
    readOnly?: boolean;
    disabled?: boolean;
    variant?: 'input' | 'checkable' | 'button';

    checked?: boolean;
}

const WidgetRoot = ({
    asChild,
    className,
    disabled,
    ref,
    variant = 'input',
    checked,
    ...props
}: WidgetRootProps & Slottable) => {
    const Comp = asChild ? Slot : 'div';
    return (
        <WidgetContext.Provider value={{ disabled }}>
            <Comp
                className={classnames(
                    'shadow-inner-sm placeholder:text-neutral-400',
                    'border border-solid outline-transparent border-neutral-300 bg-white text-sm text-neutral-900 transition-colors duration-200',

                    !disabled && 'hover:border-neutral-400',
                    !disabled && 'ui-invalid:border-error-500',
                    !disabled && 'active:border-neutral-400',
                    !disabled && 'focus:!border-theme-500 focus:outline focus:outline-theme-100 focus:outline-3',
                    !disabled &&
                        'focus-within:!border-theme-500 focus-within:outline focus-within:outline-theme-100 focus-within:outline-3',
                    !disabled &&
                        'group-ui-highlighted:!border-theme-500 group-ui-highlighted:outline group-ui-highlighted:outline-theme-100 group-ui-highlighted:outline-3',
                    !disabled &&
                        'ui-state-open:!border-theme-500 ui-state-open:outline ui-state-open:outline-theme-100 ui-state-open:outline-3',
                    disabled && 'bg-neutral-100 shadow-none',

                    // variants
                    variant === 'input' && classnames('flex w-full rounded'),
                    variant === 'checkable' &&
                        classnames(
                            checked && !disabled && 'bg-theme-600 !border-transparent',
                            checked && disabled && 'bg-neutral-400 border-transparent',
                            !disabled &&
                                'group-ui-state-checked:bg-theme-600 group-ui-state-checked:border-transparent',
                            disabled && 'group-ui-state-checked:bg-neutral-400'
                        ),
                    variant === 'button' &&
                        classnames(
                            'shadow-sm',
                            !disabled && 'hover:bg-neutral-100',
                            !disabled && 'active:bg-neutral-200',
                            !disabled && 'ui-state-open:bg-neutral-200 ui-state-open:shadow-inner-sm',
                            disabled && 'opacity-100 bg-neutral-100 shadow-none'
                        ),

                    className
                )}
                ref={ref}
                {...props}
            />
        </WidgetContext.Provider>
    );
};

/* -------------------------------------------------------------------------------------------------
 * Widget Native
 * -----------------------------------------------------------------------------------------------*/

interface WidgetNativeProps extends React.ComponentPropsWithRef<'div'> {
    variant?: 'hidden' | 'inset';
}

const WidgetNative = ({ asChild, className, variant = 'hidden', ...props }: WidgetNativeProps & Slottable) => {
    const Comp = asChild ? Slot : 'div';
    return (
        <Comp
            className={classnames(
                variant === 'hidden' && 'absolute bottom-0 opacity-0 h-0 w-0 pointer-events-none flex',
                variant === 'inset' && 'absolute inset-0 opacity-0',
                className
            )}
            {...props}
        />
    );
};

/* -------------------------------------------------------------------------------------------------
 * Widget Content
 * -----------------------------------------------------------------------------------------------*/

interface WidgetContentProps extends React.ComponentPropsWithRef<'div'> {}

const WidgetContent = ({ asChild, className, ...props }: WidgetContentProps & Slottable) => {
    const Comp = asChild ? Slot : 'div';
    return <Comp className={classnames('flex flex-1 rounded overflow-hidden', className)} {...props} />;
};

/* -------------------------------------------------------------------------------------------------
 * Widget Controls
 * -----------------------------------------------------------------------------------------------*/

interface WidgetControlsProps extends React.ComponentPropsWithRef<'div'> {}

const getFlatChildren = (children: React.ReactNode) => {
    const childArray: React.ReactNode[] = [];

    React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && child.type === React.Fragment) {
            childArray.push(...getFlatChildren(child.props.children));
        } else if (React.isValidElement(child)) {
            childArray.push(child);
        }
    });

    return childArray;
};

const WidgetControls = ({ asChild, className, children, ...props }: WidgetControlsProps & Slottable) => {
    const flatChildren = getFlatChildren(children);
    const { disabled } = useContext(WidgetContext);

    if (flatChildren.length === 0) {
        return null;
    }

    const Comp = asChild ? Slot : 'div';
    return (
        <Comp
            className={classnames('flex-none box-content top-0 right-0 flex gap-0.5 items-center p-0.5', className)}
            {...props}
        >
            {flatChildren.map((child, i) => (
                <React.Fragment key={i}>
                    <Slot {...{ disabled }}>{child}</Slot>
                    {i < flatChildren.length - 1 && <span className="border-r border-solid border-neutral-300 h-4" />}
                </React.Fragment>
            ))}
        </Comp>
    );
};

/* -------------------------------------------------------------------------------------------------
 * Widget Control Button
 * -----------------------------------------------------------------------------------------------*/

interface WidgetControlButtonProps extends ButtonProps {}

const WidgetControlButton = ({
    asChild,
    className,
    active,
    // variant = 'outline',
    ...props
}: WidgetControlButtonProps & Slottable) => {
    const Comp = asChild ? Slot : 'button';
    return (
        <Comp
            type="button"
            className={classnames(
                'flex rounded-sm justify-center items-center h-full box-content w-7 text-sm text-neutral-400 transition-colors duration-200',
                !props.disabled &&
                    'hover:text-neutral-600 hover:bg-neutral-100 active:!text-neutral-700 active:!bg-neutral-200',
                active && '!bg-neutral-200 !text-neutral-700',
                className
            )}
            tabIndex={-1}
            {...props}
        />
    );
};

/* -------------------------------------------------------------------------------------------------
 * Use Widget State
 * -----------------------------------------------------------------------------------------------*/

const isCheckboxInput = (element: FieldElement): element is HTMLInputElement => element.type === 'checkbox';

const getEventValue = (event: { target: any }) => {
    if (!event.target) return;

    if (isMultipleSelect(event.target)) {
        return Array.from(event.target.selectedOptions, (option: any) => option.value);
    } else if (isCheckboxInput(event.target)) {
        return event.target.checked;
    } else {
        return event.target.value;
    }
};

export const useWidgetState = <T, K>(
    initialValue?: T,
    controlledValue?: T,
    onChange?: (event: React.ChangeEvent<K>) => void
): [T, (event: React.ChangeEvent<K>) => void] => {
    const [value, setValue] = useControllableState<T>(initialValue, controlledValue);

    const handleChange = (event: React.ChangeEvent<K>) => {
        setValue(getEventValue(event));
        onChange?.(event);
    };

    return [value, handleChange];
};

/* -----------------------------------------------------------------------------------------------*/

export default Object.assign(WidgetRoot, {
    Content: WidgetContent,
    Controls: WidgetControls,
    ControlButton: WidgetControlButton,
    Native: WidgetNative,
});
