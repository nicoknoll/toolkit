import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { classnames } from '@nicoknoll/utils';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = ({
    className,
    align = 'center',
    sideOffset = 4,
    ref,

    forceMount,
    container,
    disableInteractions,

    onKeyDown,

    ...props
}: React.ComponentPropsWithRef<typeof PopoverPrimitive.Content> & {
    container?: HTMLElement;
    disableInteractions?: boolean;
}) => (
    <PopoverPrimitive.Portal forceMount={forceMount} container={container || document.querySelector('#root')!}>
        <div className={classnames(disableInteractions && 'pointer-events-none invisible')}>
            <PopoverPrimitive.Content
                ref={ref}
                align={align}
                sideOffset={sideOffset}
                className={classnames(
                    'z-[5000] rounded-lg border border-solid border-neutral-300 bg-white p-4 shadow-md outline-none ui-state-open:animate-in ui-state-closed:animate-out ui-state-closed:fade-out-0 ui-state-open:fade-in-0 ui-state-closed:zoom-out-95 ui-state-open:zoom-in-95 ui-side-bottom:slide-in-from-top-2 ui-side-left:slide-in-from-right-2 ui-side-right:slide-in-from-left-2 ui-side-top:slide-in-from-bottom-2 overflow-auto scrollbar-thin',
                    'max-h-[calc(var(--radix-popover-content-available-height)-10px)] min-w-[var(--radix-popover-trigger-width)]',
                    className
                )}
                {...props}
            />
        </div>
    </PopoverPrimitive.Portal>
);

export default Object.assign(Popover, {
    Trigger: PopoverTrigger,
    Content: PopoverContent,
    Anchor: PopoverPrimitive.Anchor,
});
