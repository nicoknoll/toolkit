import * as React from 'react';
import { classnames } from '@nicoknoll/utils';

const Skeleton = ({ className }: { className?: string }) => (
    <div
        className={classnames(
            'inline-block animate-pulse gap-4 items-center justify-center bg-neutral-300 h-3 w-9/12 rounded',
            className
        )}
    />
);

export default Skeleton;
