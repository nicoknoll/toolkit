import { classnames } from '@nicoknoll/utils';
import { useControllableState } from '@nicoknoll/utils';
import { Slottable } from '../widgets/Select.tsx';
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { useLayoutEffect, useState } from 'react';
import { mergeRefs } from '@nicoknoll/utils';
import { LoaderIcon } from 'lucide-react';

export interface ButtonProps extends Omit<React.ComponentPropsWithRef<'button'>, 'onClick'>, Slottable {
    active?: boolean;
    variant?: 'outline' | 'ghost' | 'link';

    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
    loading?: boolean;
    onLoadingChange?: (loading: boolean | undefined) => void;
    disabled?: boolean;
}

const Button = ({
    ref,
    asChild,
    className,
    active,
    variant = 'outline',
    loading,
    onLoadingChange,
    disabled: propsDisabled,
    onClick,
    style,
    ...props
}: ButtonProps) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const [isLoading, setIsLoading] = useControllableState(false, loading, onLoadingChange);
    const [buttonDimensions, setButtonDimensions] = useState<{ width: number; height: number } | null>(null);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!onClick) return;

        setIsLoading(true);
        return Promise.resolve(onClick?.(e))
            .finally(() => {
                setIsLoading(false);
            })
            .then((result: any) => {
                return result;
            })
            .catch((error: any) => {
                console.error(error);
            });
    };

    useLayoutEffect(() => {
        // make sure when content changes it first renders the button with the new content
        setButtonDimensions(null);

        // then measure the button
        setTimeout(() => {
            if (!buttonRef.current) return;
            const rect = buttonRef.current.getBoundingClientRect();
            setButtonDimensions({
                width: rect.width,
                height: rect.height,
            });
        }, 0);
    }, [props.children]);

    const disabled = propsDisabled || isLoading;

    const Comp = asChild ? Slot : 'button';
    return (
        <Comp
            ref={mergeRefs(buttonRef, ref)}
            onClick={handleClick}
            disabled={disabled}
            className={classnames(
                'bg-white text-neutral-800 rounded px-2 py-1.5 font-medium text-sm border border-solid inline-flex items-center justify-center !outline-theme-100 ui-state-open:outline ui-state-open:outline-3 focus:outline focus:outline-3 outline-offset-0 ',
                'hover:bg-neutral-100 transition-all',
                'ui-state-open:border-neutral-400 ui-state-open:bg-neutral-200 ui-state-open:shadow-inner-sm',
                'disabled:pointer-events-none',
                variant === 'outline' &&
                    'disabled:text-neutral-500 bg-white border-neutral-300 shadow-sm hover:border-neutral-400 ui-state-open:border-neutral-400 active:border-neutral-400 active:bg-neutral-200 active:shadow-inner-sm',
                variant === 'outline' && disabled && ' bg-neutral-100 shadow-none',
                !disabled && active && variant === 'outline' && 'border-neutral-400 shadow-inner-sm bg-neutral-200',
                variant === 'ghost' && 'bg-transparent border-transparent',
                variant === 'link' &&
                    'bg-transparent border-none p-0 text-indigo-600 disabled:text-neutral-500 hover:bg-transparent hover:text-indigo-800',
                !disabled && active && '!bg-neutral-200 !border-neutral-400 shadow-inner-sm',
                className
            )}
            {...props}
            style={{
                width: buttonDimensions != null ? `${buttonDimensions.width}px` : undefined,
                height: buttonDimensions != null ? `${buttonDimensions.height}px` : undefined,
                ...style,
            }}
        >
            {isLoading ? (
                <span className="animate-spin-slow block">
                    <LoaderIcon />
                </span>
            ) : (
                props.children
            )}
        </Comp>
    );
};

export default Button;
