import Button from '@nicoknoll/forms/src/misc/Button.tsx';
import DropdownMenu from './DropdownMenu.tsx';
import { EllipsisVerticalIcon } from 'lucide-react';
import { classnames } from '@nicoknoll/utils';

const MoreMenu = ({ children }: any) => {
    return (
        <DropdownMenu>
            <DropdownMenu.Trigger asChild>
                <Button className="inline-flex items-center justify-center h-[2.125rem]" variant="ghost">
                    <EllipsisVerticalIcon />
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">{children}</DropdownMenu.Content>
        </DropdownMenu>
    );
};

const MoreMenuItem = ({ className, danger, ...props }: any) => {
    return (
        <DropdownMenu.Item
            {...props}
            className={classnames(danger && 'text-red-600 focus:bg-red-50 focus:text-red-700', className)}
        />
    );
};

export default Object.assign(MoreMenu, {
    Item: MoreMenuItem,
    Separator: DropdownMenu.Separator,
});
