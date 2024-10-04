import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { classnames } from '@nicoknoll/utils';

const TooltipContent = ({ className, ...props }: React.ComponentPropsWithRef<typeof TooltipPrimitive.Content>) => (
    <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
            className={classnames('text-sm text-white bg-black/80 backdrop-blur px-2 py-1 rounded', className)}
            {...props}
        />
    </TooltipPrimitive.Portal>
);

const Tooltip = ({
    children,
    delayDuration = 200,
    ...props
}: React.ComponentPropsWithRef<typeof TooltipPrimitive.Root>) => (
    <TooltipPrimitive.Provider>
        <TooltipPrimitive.Root delayDuration={delayDuration} {...props}>
            {children}
        </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
);

export default Object.assign(Tooltip, { Trigger: TooltipPrimitive.Trigger, Content: TooltipContent });
