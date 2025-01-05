import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { classnames } from '@nicoknoll/utils';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { de } from 'date-fns/locale';
import SingleSelect from './SingleSelect.tsx';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

const Calendar = ({
    className,
    classNames,
    showOutsideDays = true,
    modifiers = {},
    modifiersClassNames = {},
    ...props
}: CalendarProps) => {
    // highlight weekend days
    const customModifiers = {
        weekend: { dayOfWeek: [0, 6] },
    };

    return (
        <DayPicker
            locale={de}
            captionLayout="dropdown-buttons"
            showOutsideDays={showOutsideDays}
            weekStartsOn={1}
            modifiersClassNames={{ ...modifiersClassNames }}
            modifiers={{ ...customModifiers, ...modifiers }}
            className={classnames('p-3', className)}
            classNames={{
                months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                month: 'space-y-4',
                caption: 'flex justify-center pt-1 relative items-center',
                caption_label: 'text-sm font-medium',
                caption_dropdowns: 'flex items-center shadow-sm gap-1',
                nav: 'space-x-1 flex items-center',
                nav_button:
                    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-neutral-300 text-neutral-900 bg-background shadow-sm hover:bg-neutral-100 hover:text-neutral-800 hover:border-neutral-400 h-[2.175rem] w-7 bg-transparent p-0',
                nav_button_previous: 'absolute left-0.5',
                nav_button_next: 'absolute right-0.5',
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex',
                head_cell: 'text-neutral-500 rounded-md w-9 font-normal text-[0.8rem]',
                row: 'flex w-full',
                cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-neutral-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                day: 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-neutral-100 hover:text-neutral-800 h-9 w-9 p-0 font-normal aria-selected:opacity-100',
                day_selected:
                    'bg-theme-600 !text-white hover:bg-theme-600 hover:text-white focus:bg-theme-600 focus:text-white rounded-md',
                day_today: 'text-theme-600 rounded-md underline decoration-2 underline-offset-4',
                day_outside: 'text-neutral-500 opacity-50',
                day_disabled: 'text-neutral-500 opacity-50',
                day_range_start: 'aria-selected:bg-theme-600 aria-selected:text-white rounded-l-md',
                day_range_middle: 'aria-selected:bg-theme-600 aria-selected:text-white rounded-none',
                day_range_end: 'aria-selected:bg-theme-600 aria-selected:text-white rounded-r-md',
                day_hidden: 'invisible',
                vhidden: 'hidden',
                ...classNames,
            }}
            components={{
                IconLeft: ({ ...props }) => <ChevronLeftIcon className="h-4 w-4" />,
                IconRight: ({ ...props }) => <ChevronRightIcon className="h-4 w-4" />,
                Dropdown: ({ ...props }) => {
                    const { name, onChange, value } = props;
                    return (
                        <SingleSelect
                            className={classnames(name === 'months' && 'min-w-[6.75rem]', props.className)}
                            onChange={onChange}
                            value={value?.toString()}
                            name={name}
                            options={React.Children.map(props.children, (child: any) => {
                                return {
                                    value: child.props?.value.toString(),
                                    label: child.props?.children,
                                };
                            })}
                            required
                            hideSearch
                            hideCheck
                        />
                    );
                },
            }}
            {...props}
        />
    );
};

export default Calendar;
