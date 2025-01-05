import * as React from 'react';
import { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { mergeEventHandlers, mergeProps, mergeRefs, useControllableState } from '@nicoknoll/utils';
import { Slot } from '@radix-ui/react-slot';
import { useMultipleSelection, useSelect } from 'downshift';
import { renderToString } from 'react-dom/server';
import { setNativeSelectValue } from '../utils/setNativeInputValue.ts';
import isEqual from 'lodash/isEqual';

export interface Slottable {
    asChild?: true;
}

export interface Option {
    value: string;
    label?: React.ReactNode;
    [key: string]: any;
}

/* -------------------------------------------------------------------------------------------------
 * Select Context
 * -----------------------------------------------------------------------------------------------*/

interface SelectContextProps<T> {
    multiple?: boolean;

    selected: T;
    onSelectedChange: (value: T | undefined) => void;

    search: string;
    onSearchChange: (search: string) => void;

    forceMount?: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;

    allowAddOption?: boolean;
    onAddOption?: (value: string) => void;
    options: Option[];
    filteredOptions: Option[];
    selectedOptions: Option[];

    disabled?: boolean;
    required?: boolean;

    // state management
    registerOption(option: Option, index?: number): void;
    unregisterOption(option: Option): void;

    // refs
    toggleButtonRef?: React.RefObject<HTMLButtonElement>;
}

interface SelectContextValue<T> extends SelectContextProps<T> {
    // prop getters
    highlightedIndex: number;
    getToggleButtonProps: any;
    getMenuProps: any;
    getInputProps: any;
    getItemProps: any;
    getSelectedItemProps: any;
    getDropdownProps: any;
}

export const SelectContext = React.createContext<SelectContextValue<any> | undefined>(undefined);

const SelectContextProvider = <T,>({
    children,
    highlightOnMouseOver = false,
    ...props
}: SelectContextProps<T> & { children: React.ReactNode; highlightOnMouseOver?: boolean }) => {
    const {
        filteredOptions,
        selected,
        selectedOptions,
        onSelectedChange,
        multiple,
        forceMount,
        open,
        onOpenChange,
        search,
        onSearchChange,
        disabled,
    } = props;

    const toggleButtonRef = useRef<HTMLButtonElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const selectedIndex = filteredOptions?.findIndex((option) => option.value === selectedOptions[0]?.value);

    const { getSelectedItemProps, getDropdownProps } = useMultipleSelection<Option>({
        selectedItems: selectedOptions,
        onStateChange({ selectedItems: newSelectedItems, type }) {
            switch (type) {
                case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownBackspace:
                case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownDelete:
                case useMultipleSelection.stateChangeTypes.DropdownKeyDownBackspace:
                case useMultipleSelection.stateChangeTypes.FunctionRemoveSelectedItem:
                    onSelectedChange(
                        (multiple
                            ? (newSelectedItems || []).map((item) => item.value)
                            : newSelectedItems?.[0]?.value) as T
                    );
                    break;
                default:
                    break;
            }
        },
    });

    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

    useEffect(() => {
        if (open || forceMount) {
            setHighlightedIndex(
                highlightedIndex != null && highlightedIndex > -1
                    ? highlightedIndex
                    : selectedIndex >= 0
                      ? selectedIndex
                      : 0
            );
        } else {
            setHighlightedIndex(-1);
        }
    }, [open]);

    const { getToggleButtonProps, getMenuProps, getItemProps } = useSelect<Option>({
        onIsOpenChange: ({ isOpen, highlightedIndex }) => {
            if (disabled) return;
            onOpenChange(isOpen);
            if (isOpen) {
                setHighlightedIndex(
                    highlightedIndex != null && highlightedIndex > -1
                        ? highlightedIndex
                        : selectedIndex >= 0
                          ? selectedIndex
                          : 0
                );

                // Note: maybe not the cleanest way but it is working
                setTimeout(() => {
                    searchRef.current?.focus();
                }, 10);
            }
        },
        isOpen: disabled ? false : open,
        items: filteredOptions, // filteredOptions otherwise index doesn't match
        itemToString(item) {
            return item ? item.value : '';
        },
        highlightedIndex,
        onHighlightedIndexChange: ({ highlightedIndex }) => {
            setHighlightedIndex(highlightedIndex);
        },
        selectedItem: null,
        isItemDisabled: (item) => item?.disabled,
        stateReducer(state, actionAndChanges) {
            let { changes, type, index } = actionAndChanges;
            switch (type) {
                case useSelect.stateChangeTypes.ToggleButtonBlur:
                    // allow autofocus on search when opened
                    if (document.activeElement === searchRef.current) {
                        changes = {
                            ...changes,
                            highlightedIndex: state.highlightedIndex,
                            isOpen: true,
                        };
                    }
                    break;

                case useSelect.stateChangeTypes.ToggleButtonClick:
                    changes = {
                        ...changes,
                        isOpen: true,
                    };
                    break;

                case useSelect.stateChangeTypes.ItemMouseMove:
                    changes = {
                        ...changes,
                        isOpen: state.isOpen,
                        highlightedIndex: highlightOnMouseOver ? changes.highlightedIndex : state.highlightedIndex,
                    };
                    break;

                case useSelect.stateChangeTypes.MenuMouseLeave:
                    // seems like a case that is only for when always open
                    changes = {
                        ...changes,
                        isOpen: state.isOpen,
                        highlightedIndex: highlightOnMouseOver ? changes.highlightedIndex : state.highlightedIndex,
                    };
                    break;

                case useSelect.stateChangeTypes.ToggleButtonKeyDownEnter:
                case useSelect.stateChangeTypes.ItemClick:
                    changes = {
                        ...changes,
                        isOpen: !!multiple, // keep the dropdown open when selecting multiple items.
                        highlightedIndex: index, // focus selected item
                    };
                    break;
            }

            return changes;
        },
        onStateChange({ type, selectedItem: newSelectedItem }) {
            switch (type) {
                case useSelect.stateChangeTypes.ToggleButtonClick:
                case useSelect.stateChangeTypes.ToggleButtonKeyDownEnter:
                case useSelect.stateChangeTypes.ItemClick:
                    // case useSelect.stateChangeTypes.ToggleButtonBlur:
                    toggleButtonRef.current?.focus();

                    if (newSelectedItem) {
                        if (multiple && Array.isArray(selected)) {
                            if (!selected?.includes(newSelectedItem.value)) {
                                onSelectedChange([...(selected || []), newSelectedItem.value] as T);
                            } else {
                                onSelectedChange(selected?.filter((v: string) => v !== newSelectedItem.value) as T);
                            }
                        } else {
                            onSelectedChange(newSelectedItem.value as T);
                        }
                        onSearchChange('');
                    }
                    break;

                default:
                    break;
            }
        },
    });

    const getInputProps = (props: any) => {
        const toggleButtonProps = getToggleButtonProps();

        const inputProps = {
            ref: searchRef,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                setHighlightedIndex(0);
                onSearchChange(e.target.value);
            },
            onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === 'Escape') {
                    e.preventDefault();
                    toggleButtonProps.onKeyDown?.(e);
                }
            },
            value: search,
        };

        return mergeProps(inputProps, props);
    };

    return (
        <SelectContext.Provider
            value={{
                ...props,
                highlightedIndex,
                getToggleButtonProps,
                getMenuProps,
                getInputProps,
                getItemProps,
                getSelectedItemProps,
                getDropdownProps,
                toggleButtonRef,
            }}
        >
            {children}
        </SelectContext.Provider>
    );
};

/* -------------------------------------------------------------------------------------------------
 * Select
 * -----------------------------------------------------------------------------------------------*/

interface SelectRootProps<T> extends Omit<React.ComponentPropsWithRef<'div'>, 'onChange' | 'onInput'>, Slottable {
    asChild?: true;
    multiple?: true;

    defaultSelected?: T;
    selected?: T;
    onSelectedChange?: (value: T | undefined) => void;

    defaultSearch?: string;
    search?: string;
    onSearchChange?: (search: string | undefined) => void;
    searchFilter?: (option: Option, search: string) => boolean;

    forceMount?: boolean;
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;

    allowAddOption?: boolean;
    onAddOption?: (value: string) => void;

    // form props
    name?: string;
    disabled?: boolean;
    required?: boolean;

    // context control props
    highlightOnMouseOver?: boolean;
}

const defaultFilter = (option: Option, search: string) =>
    renderToString(option.label)?.toLowerCase().includes(search.toLowerCase()) ||
    option.value.toLowerCase().includes(search.toLowerCase());

const SelectRoot = <T extends string | string[]>({
    ref,
    asChild,

    multiple,
    children,

    defaultSelected: propsDefaultSelected,
    selected: propsSelected,
    onSelectedChange: propsOnSelectedChange,

    defaultSearch: propsDefaultSearch,
    search: propsSearch,
    onSearchChange: propsOnSearchChange = () => {},
    searchFilter = defaultFilter,

    forceMount,
    defaultOpen: propsDefaultOpen,
    open: propsOpen,
    onOpenChange: propsOnOpenChange,

    allowAddOption,
    onAddOption,

    disabled,
    required,

    // context control props
    highlightOnMouseOver,

    ...props
}: SelectRootProps<T>) => {
    const rootRef = useRef<HTMLDivElement>(null);

    /* State */

    const initialSelected = propsDefaultSelected ?? ((multiple ? [] : '') as T | undefined);
    const [selected, setSelected] = useControllableState<T | undefined>(
        initialSelected,
        propsSelected,
        propsOnSelectedChange
    );

    useEffect(() => {
        // keep controllable state in sync with outside changes
        if (!isEqual(selected, initialSelected)) {
            setSelected(selected);
        }
    }, [initialSelected, multiple]);

    if (multiple && !Array.isArray(selected)) {
        throw new Error('SelectRoot: selected must be an array when multiple is true');
    } else if (!multiple && Array.isArray(selected)) {
        throw new Error('SelectRoot: selected must be a string when multiple is false');
    }

    const [search, setSearch] = useControllableState<string>(
        propsDefaultSearch ?? '',
        propsSearch,
        propsOnSearchChange
    );
    const [open, setOpen] = useControllableState<boolean>(propsDefaultOpen ?? false, propsOpen, propsOnOpenChange);

    /* Options */

    const [registeredOptions, setRegisteredOptions] = useState<Option[]>([]);
    const [options, setOptions] = useState<Option[]>([]);

    useLayoutEffect(() => {
        if (open || forceMount) {
            setOptions(registeredOptions);
        }
    }, [open, registeredOptions]);

    useLayoutEffect(() => {
        // select the first option when the options change and no option is selected
        if (required && options.length > 0 && selected === '') {
            setSelected(options[0].value as T);
        }
    }, [options?.length]);

    const registerOption = (option: Option, index?: number) => {
        setRegisteredOptions((prevOptions) => {
            if (index !== undefined) {
                return [...prevOptions.slice(0, index), option, ...prevOptions.slice(index)];
            }
            return [...prevOptions, option];
        });
    };

    const unregisterOption = (option: Option) => {
        setRegisteredOptions((prevOptions) => prevOptions.filter((prevOption) => prevOption.value !== option.value));
    };

    const filteredOptions = useMemo(
        () => (searchFilter ? options.filter((option) => searchFilter(option, search || '')) : options),
        [options, searchFilter, search]
    );

    const selectedOptions = useMemo(() => {
        const selectedArray: string[] = Array.isArray(selected) ? selected : selected !== undefined ? [selected] : [];
        const selectedOptions: Option[] = [];
        const addedOptions: Option[] = [];
        for (const value of selectedArray) {
            const option = options.find((option) => option.value === value);
            if (option) {
                selectedOptions.push(option);
            } else {
                addedOptions.push({ value, label: value });
            }
        }

        // sort selected options to match the order of the options
        selectedOptions.sort((a: Option, b: Option) => {
            return (
                options.findIndex((option) => option.value === a.value) -
                options.findIndex((option) => option.value === b.value)
            );
        });

        return selectedOptions.concat(addedOptions);
    }, [selected, options]);

    /* ----------------------------- */

    const Comp = asChild ? Slot : 'div';
    return (
        <SelectContextProvider
            multiple={!!multiple}
            search={search || ''}
            onSearchChange={setSearch}
            open={open}
            onOpenChange={setOpen}
            allowAddOption={allowAddOption}
            onAddOption={onAddOption}
            selected={selected as T}
            onSelectedChange={setSelected}
            registerOption={registerOption}
            unregisterOption={unregisterOption}
            options={options}
            filteredOptions={filteredOptions}
            selectedOptions={selectedOptions}
            disabled={disabled}
            required={required}
            highlightOnMouseOver={highlightOnMouseOver}
        >
            <Comp {...props} ref={rootRef}>
                {children}
            </Comp>
        </SelectContextProvider>
    );
};

/* -------------------------------------------------------------------------------------------------
 * SelectSearch
 * -----------------------------------------------------------------------------------------------*/

interface SelectSearchProps extends React.ComponentPropsWithRef<'input'>, Slottable {}

const SelectSearch = ({ asChild, ...props }: SelectSearchProps) => {
    const { getInputProps } = useContext(SelectContext)!;
    const inputProps = getInputProps();

    const Comp = asChild ? Slot : 'input';
    return <Comp {...mergeProps(inputProps, props)} />;
};

/* -------------------------------------------------------------------------------------------------
 * SelectContent
 * -----------------------------------------------------------------------------------------------*/

interface SelectContentProps extends React.ComponentPropsWithRef<'div'>, Slottable {}

const SelectContent = ({ asChild, ...props }: SelectContentProps) => {
    const contentRef = useRef<HTMLDivElement>(null);

    const { open, getMenuProps } = useContext(SelectContext)!;

    const menuProps = getMenuProps();
    const mergedProps = mergeProps(menuProps, props);

    const Comp = asChild ? Slot : 'div';
    return <Comp {...mergedProps} ref={mergeRefs(mergedProps.ref, contentRef)} data-state={open ? 'open' : 'closed'} />;
};

/* -------------------------------------------------------------------------------------------------
 * SelectValue
 * -----------------------------------------------------------------------------------------------*/

interface SelectValueProps extends Omit<React.ComponentPropsWithRef<'span'>, 'children'>, Slottable {
    placeholder?: React.ReactNode;
}

const SelectValue = ({ asChild, placeholder = '', ...props }: SelectValueProps): React.ReactNode => {
    const valueRef = useRef<HTMLSpanElement>(null);

    const { selectedOptions } = useContext(SelectContext)!;

    const renderedLabels =
        selectedOptions.length > 1
            ? // TODO: join doesnt work on formatted values
              selectedOptions.map((option) => option.label).join(', ')
            : selectedOptions[0]?.label;

    const showPlaceholder =
        selectedOptions.length === 0 || (selectedOptions.length === 1 && selectedOptions[0].value === '');

    const Comp = asChild ? Slot : 'span';
    return (
        <Comp {...props} ref={mergeRefs(valueRef, props.ref)} data-placeholder={showPlaceholder ? '' : undefined}>
            {showPlaceholder ? placeholder : renderedLabels}
        </Comp>
    );
};

/* -------------------------------------------------------------------------------------------------
 * SelectTrigger
 * -----------------------------------------------------------------------------------------------*/

interface SelectTriggerProps extends React.ComponentPropsWithRef<'button'>, Slottable {}

const SelectTrigger = ({ asChild, ...props }: SelectTriggerProps) => {
    const { disabled, getToggleButtonProps, required, getDropdownProps, open, toggleButtonRef } =
        useContext(SelectContext)!;

    const toggleButtonProps = getToggleButtonProps(getDropdownProps({ preventKeyAction: open }));
    delete toggleButtonProps.tabIndex; // otherwise it's not focusable
    const mergedProps = mergeProps(toggleButtonProps, props);

    const isDisabled = disabled || mergedProps.disabled;

    const Comp = asChild ? Slot : 'button';
    return (
        <Comp
            type="button"
            data-state={open ? 'open' : 'closed'}
            data-disabled={isDisabled ? '' : undefined}
            aria-required={required}
            {...mergedProps}
            ref={mergeRefs(toggleButtonRef, mergedProps.ref)}
            disabled={isDisabled}
        />
    );
};

/* -------------------------------------------------------------------------------------------------
 * SelectGroup
 * -----------------------------------------------------------------------------------------------*/

interface SelectGroupProps extends React.ComponentPropsWithRef<'div'>, Slottable {}

const SelectGroup = ({ asChild, ...props }: SelectGroupProps) => {
    const Comp = asChild ? Slot : 'div';
    return <Comp {...props} />;
};

/* -------------------------------------------------------------------------------------------------
 * SelectGroupLabel
 * -----------------------------------------------------------------------------------------------*/

interface SelectGroupLabelProps extends React.ComponentPropsWithRef<'label'>, Slottable {}

const SelectGroupLabel = ({ asChild, ...props }: SelectGroupLabelProps) => {
    const Comp = asChild ? Slot : 'label';
    return <Comp role="group" {...props} />;
};

/* -------------------------------------------------------------------------------------------------
 * SelectSeparator
 * -----------------------------------------------------------------------------------------------*/

interface SelectSeparatorProps extends React.ComponentPropsWithRef<'div'>, Slottable {}

const SelectSeparator = ({ asChild, ...props }: SelectSeparatorProps) => {
    const Comp = asChild ? Slot : 'div';
    return <Comp aria-hidden="true" role="separator" {...props} />;
};

/* -------------------------------------------------------------------------------------------------
 * SelectOption
 * -----------------------------------------------------------------------------------------------*/

interface SelectOptionContextValue {
    isSelected?: boolean;
    isHighlighted?: boolean;
    value: string;
    onTextChange: (text: React.ReactNode) => void;
}

export const SelectOptionContext = React.createContext<SelectOptionContextValue | undefined>(undefined);

interface SelectOptionProps extends React.ComponentPropsWithRef<'div'>, Slottable {
    value: string;
    index?: number;

    disabled?: boolean;
}

const SelectOption = ({ asChild, value, disabled, index = undefined, ...props }: SelectOptionProps) => {
    const optionRef = useRef<HTMLDivElement>(null);

    const { filteredOptions, selectedOptions, getItemProps, highlightedIndex, registerOption, unregisterOption } =
        useContext(SelectContext)!;

    const [text, setText] = useState<React.ReactNode>('');
    const itemData = { ref: optionRef, value, label: text, disabled };

    useLayoutEffect(() => {
        registerOption(itemData, index);
        return () => unregisterOption(itemData);
    }, [value, text, disabled, index]);

    const optionIndex = filteredOptions?.findIndex((option) => option.value === value);
    const option = optionIndex !== undefined && optionIndex > -1 ? filteredOptions?.[optionIndex] : undefined;
    const isSelected = selectedOptions?.some((selectedOption) => selectedOption.value === value);

    if (!option) return null;

    const itemProps = getItemProps({ item: option, index: optionIndex });
    const mergedProps = mergeProps(itemProps, props);
    const isHighlighted = highlightedIndex === optionIndex;

    const Comp = asChild ? Slot : 'div';
    return (
        <SelectOptionContext.Provider value={{ isSelected, isHighlighted, value, onTextChange: setText }}>
            <Comp
                {...mergedProps}
                ref={mergeRefs(optionRef, mergedProps.ref)}
                role="option"
                aria-disabled={disabled || undefined}
                data-selected={isSelected ? '' : undefined}
                data-highlighted={isHighlighted ? '' : undefined}
                data-state={isSelected ? 'checked' : 'unchecked'}
                data-disabled={disabled ? '' : undefined}
            />
        </SelectOptionContext.Provider>
    );
};

/* -------------------------------------------------------------------------------------------------
 * SelectOptionText
 * -----------------------------------------------------------------------------------------------*/

interface SelectOptionTextProps extends React.ComponentPropsWithRef<'span'>, Slottable {}

const SelectOptionText = ({ asChild, children, ...props }: SelectOptionTextProps) => {
    const { onTextChange } = useContext(SelectOptionContext)!;

    useLayoutEffect(() => {
        onTextChange(children);
    }, [children]);

    const Comp = asChild ? Slot : 'span';
    return <Comp {...props}>{children}</Comp>;
};

/* -------------------------------------------------------------------------------------------------
 * SelectOptionIndicator
 * -----------------------------------------------------------------------------------------------*/

interface SelectOptionIndicatorProps extends React.ComponentPropsWithRef<'span'>, Slottable {}

const SelectOptionIndicator = ({ asChild, ...props }: SelectOptionIndicatorProps) => {
    const { isSelected } = useContext(SelectOptionContext)!;

    if (!isSelected) return null;

    const Comp = asChild ? Slot : 'span';
    return <Comp {...props} />;
};

/* -------------------------------------------------------------------------------------------------
 * SelectNative
 * -----------------------------------------------------------------------------------------------*/

interface UseSelectNativeProps {
    focusRef?: React.RefObject<HTMLElement>;
    onFocus?: React.FocusEventHandler<HTMLSelectElement>;
    value?: string | string[];
    onChange?: React.ChangeEventHandler<HTMLSelectElement>;
}

export const useSelectNative = ({ focusRef, onFocus, value, onChange }: UseSelectNativeProps) => {
    const nativeRef = useRef<HTMLSelectElement>(null);

    const handleSelectedChange = (nextValue: string | string[] | undefined) => {
        // do comparison to avoid infinite loop
        if (!isEqual(value, nextValue)) {
            // this triggers the native onChange event which updates the external state
            setNativeSelectValue(nativeRef?.current!, nextValue!);
        }
    };

    const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
        focusRef?.current?.focus();
    };

    return {
        onSelectedChange: handleSelectedChange,
        selectNativeProps: {
            ref: nativeRef,
            onFocus: mergeEventHandlers(onFocus, handleFocus),
            onChange,
        },
    };
};

interface SelectNativeProps extends Omit<React.ComponentPropsWithRef<'select'>, 'value' | 'multiple'> {}

const SelectNative = ({ ref, ...props }: SelectNativeProps) => {
    const nativeRef = useRef<HTMLSelectElement>(null);

    const { multiple, options, required } = useContext(SelectContext)!;

    return (
        <select {...props} tabIndex={-1} multiple={multiple} ref={mergeRefs(nativeRef, ref)}>
            {!required && <option value="" disabled={false} />}

            {options?.map((option) => {
                const textLabel = typeof option.label === 'string' ? option.label : renderToString(option.label || '');
                return (
                    <option key={option.value} value={option.value}>
                        {textLabel}
                    </option>
                );
            })}
        </select>
    );
};

/* -----------------------------------------------------------------------------------------------*/

export default Object.assign(SelectRoot, {
    Search: SelectSearch,
    Content: SelectContent,
    Value: SelectValue,
    Trigger: SelectTrigger,
    Group: SelectGroup,
    GroupLabel: SelectGroupLabel,
    Separator: SelectSeparator,
    Option: SelectOption,
    OptionText: SelectOptionText,
    OptionIndicator: SelectOptionIndicator,
    Native: SelectNative,
});
