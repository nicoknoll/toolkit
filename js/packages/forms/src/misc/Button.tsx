import { classnames } from '../utils/classnames.ts';
import useControllableState from '../utils/useControllableState.tsx';
import { Slottable } from '../widgets/Select.tsx';
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { useState } from 'react';

export interface ButtonProps extends Omit<React.ComponentPropsWithRef<'button'>, 'onClick'>, Slottable {
    active?: boolean;
    variant?: 'outline' | 'ghost' | 'link';

    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
    loading?: boolean;
    onLoadingChange?: (loading: boolean | undefined) => void;
    disabled?: boolean;
}

const Button = ({
    asChild,
    className,
    active,
    variant = 'outline',
    loading,
    onLoadingChange,
    disabled: propsDisabled,
    onClick,
    ...props
}: ButtonProps) => {
    const [isLoading, setIsLoading] = useControllableState(false, loading, onLoadingChange);
    const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!onClick) return;

        setIsLoading(true);
        return Promise.resolve(onClick?.(e))
            .finally(() => {
                setIsLoading(false);
                setTimeout(() => {
                    setIsSuccess(null);
                }, 2000);
            })
            .then((result: any) => {
                setIsSuccess(true);
                return result;
            })
            .catch((error: any) => {
                console.error(error);
                setIsSuccess(false);
            });
    };

    const disabled = propsDisabled || isLoading || isSuccess !== null;

    const Comp = asChild ? Slot : 'button';
    return (
        <Comp
            onClick={handleClick}
            disabled={disabled}
            className={classnames(
                'bg-white text-neutral-800 rounded px-2 py-1.5 font-medium text-sm border border-solid outline-none',
                'hover:bg-neutral-100 transition-all',
                'ui-state-open:border-neutral-400 ui-state-open:bg-neutral-200 ui-state-open:shadow-inner-sm',
                'disabled:pointer-events-none',
                variant === 'outline' &&
                    'disabled:text-neutral-500 bg-white border-neutral-300 shadow-sm hover:border-neutral-400 ui-state-open:border-neutral-400 ui-state-open:outline ui-state-open:outline-neutral-100 ui-state-open:outline-3 focus:outline focus:outline-neutral-100 focus:outline-3 outline-offset-0 active:border-neutral-400 active:bg-neutral-200 active:shadow-inner-sm',
                variant === 'outline' && disabled && ' bg-neutral-100 shadow-none',
                !disabled && active && variant === 'outline' && 'border-neutral-400 shadow-inner-sm bg-neutral-200',
                variant === 'ghost' && 'bg-transparent border-transparent',
                variant === 'link' &&
                    'bg-transparent border-none p-0 text-indigo-600 disabled:text-neutral-500 hover:bg-transparent hover:text-indigo-800',
                !disabled && active && '!bg-neutral-200 !border-neutral-400 shadow-inner-sm',
                className
            )}
            {...props}
        >
            {isLoading ? 'Loading...' : isSuccess === true ? 'Success' : isSuccess === false ? 'Error' : props.children}
        </Comp>
    );
};

export default Button;
