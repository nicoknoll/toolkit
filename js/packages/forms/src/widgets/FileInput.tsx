import * as React from 'react';
import Widget, { WidgetProps } from './Widget.tsx';
import { classnames } from '@nicoknoll/utils';
import {
    ExternalLinkIcon,
    FileArchiveIcon,
    FileIcon as FileDefaultIcon,
    FileImageIcon,
    FileSpreadsheetIcon,
    FileTextIcon,
    FileVideoIcon,
    XIcon,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import isBlob from '../utils/isBlob.ts';

export interface TextInputProps extends React.ComponentPropsWithRef<'input'> {
    hideClear?: boolean;
    inputClassName?: string;
}

const isImage = (ext: string) => ['jpg', 'jpeg', 'png', 'gif'].includes(ext);

const FileIcon = ({ ext }: { ext: string }) => {
    switch (ext) {
        case 'pdf':
            return <FileTextIcon />;
        case 'doc':
        case 'docx':
            return <FileTextIcon />;
        case 'xls':
        case 'xlsx':
            return <FileSpreadsheetIcon />;
        case 'ppt':
        case 'pptx':
            return <FileVideoIcon />;
        case 'zip':
            return <FileArchiveIcon />;
        case 'txt':
            return <FileTextIcon />;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            return <FileImageIcon />;
        default:
            return <FileDefaultIcon />;
    }
};

export interface InputFile extends File {
    name: string;
    url?: string;
}

interface InputFileProps {
    className?: string;
    file: InputFile;
    onRemove?: () => void;
    disabled?: boolean;
    previewImage?: boolean;
}

const InputFile = ({ className, onRemove, file, disabled, previewImage }: InputFileProps) => {
    const ext = file.name.split('.').pop() || '';
    const basename = file.name.split('/').pop() || '';

    const url = file.url || (isBlob(file) ? URL.createObjectURL(file) : undefined);
    const [imageDimensions, setImageDimensions] = React.useState<{ width: number; height: number } | null>(null);

    return (
        <Widget
            className={classnames(
                'flex gap-1 justify-between w-full group rounded hover:border-neutral-300 shadow-sm active:border-neutral-300',
                className
            )}
            disabled={disabled}
        >
            <Widget.Content className="px-2 py-1.5 pr-0 flex items-center gap-1">
                <span className={classnames('text-neutral-400 flex-none block', previewImage && 'mr-1')}>
                    {previewImage && isImage(ext) ? (
                        <a href={!disabled ? url : undefined} target="_blank">
                            <img
                                src={url}
                                alt={basename}
                                className="w-9 h-9 object-cover rounded-sm flex-none"
                                onLoad={(e) =>
                                    setImageDimensions({
                                        width: (e.target as HTMLImageElement).naturalWidth,
                                        height: (e.target as HTMLImageElement).naturalHeight,
                                    })
                                }
                            />
                        </a>
                    ) : (
                        <FileIcon ext={ext} />
                    )}
                </span>
                <span className="flex flex-col flex-1">
                    <span className="text-sm truncate">{basename}</span>
                    {previewImage && imageDimensions && (
                        <span className="text-xs text-neutral-400">
                            {imageDimensions.width}x{imageDimensions.height}
                        </span>
                    )}
                </span>
            </Widget.Content>

            <Widget.Controls>
                {url && (
                    <Widget.ControlButton asChild>
                        <a href={!disabled ? url : undefined} target="_blank">
                            <ExternalLinkIcon />
                        </a>
                    </Widget.ControlButton>
                )}

                <Widget.ControlButton onClick={onRemove}>
                    <XIcon />
                </Widget.ControlButton>
            </Widget.Controls>
        </Widget>
    );
};

type FileInputChangeEvent = Omit<React.ChangeEvent<HTMLInputElement>, 'target'> & {
    target: Omit<React.ChangeEvent<HTMLInputElement>['target'], 'value'> & {
        files: FileList | null;
        multiple?: boolean;
    };
};

interface FileInputProps extends Omit<React.ComponentPropsWithRef<'input'>, 'value' | 'placeholder' | 'accept'> {
    value?: InputFile[];
    placeholder?: React.ReactNode;

    maxFiles?: number;
    maxSize?: number;
    minSize?: number;
    accept?: Record<string, string[]>;
    multiple?: boolean;

    onChange?: (event: FileInputChangeEvent) => void;

    previewImage?: boolean;
}

const FileInput = ({
    className,
    controls,
    onChange,
    widgetRef,
    placeholder,
    previewImage = false,
    ref,
    ...props
}: FileInputProps & WidgetProps) => {
    const handleFilesChange = (files: any[]) => {
        // mock event
        onChange?.({
            target: {
                type: 'file',
                files,
                multiple: props.multiple ? true : undefined,
            },
        } as any);
    };

    const handleAddFiles = (addedFiles: any[]) => {
        handleFilesChange(props.multiple ? [...files, ...addedFiles] : addedFiles);
        rootRef.current?.focus();
    };

    const handleRemoveFile = (index: number) => {
        handleFilesChange(files.filter((_, i) => i !== index));
        rootRef.current?.focus();
    };

    const files: InputFile[] =
        props.value && Array.isArray(props.value) ? props.value : props.value ? [props.value] : [];

    const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject, isFileDialogActive, rootRef } =
        useDropzone({
            onDropAccepted: handleAddFiles,
            disabled: props.disabled,
            maxFiles: props.maxFiles,
            maxSize: props.maxSize,
            minSize: props.minSize,
            accept: props.accept,
            multiple: props.multiple,
        });

    return (
        <div className="flex flex-col gap-2">
            {(props.multiple || files.length === 0) && (
                <Widget
                    disabled={props.disabled}
                    ref={widgetRef}
                    data-state={
                        isFileDialogActive || isDragActive
                            ? 'active'
                            : isDragAccept
                              ? 'accept'
                              : isDragReject
                                ? 'reject'
                                : undefined
                    }
                    data-placeholder=""
                    data-disabled={props.disabled ? '' : undefined}
                    className={classnames(
                        'group shadow-none transition-colors min-h-20',
                        !props.disabled && 'border-dashed bg-neutral-50 hover:bg-neutral-100',
                        'focus:border-solid focus-within:border-solid',
                        'ui-placeholder:text-neutral-400',
                        !props.disabled &&
                            'ui-state-active:bg-theme-100 ui-state-active:border-theme-500 ui-state-active:text-neutral-800 ui-state-active:border-solid',
                        props.disabled && 'pointer-events-none',
                        className
                    )}
                >
                    <Widget.Content asChild>
                        <div
                            {...getRootProps()}
                            className={classnames('px-2 py-1.5 flex flex-1 justify-center items-center')}
                        >
                            <input {...getInputProps()} />
                            <span
                                className={classnames(
                                    'text-center cursor-default select-none',
                                    props.disabled && 'pointer-events-none'
                                )}
                            >
                                {placeholder}
                            </span>
                        </div>
                    </Widget.Content>
                </Widget>
            )}

            {files.map((file, index) => (
                <InputFile
                    key={index}
                    disabled={props.disabled}
                    onRemove={() => handleRemoveFile(index)}
                    file={file}
                    previewImage={previewImage}
                />
            ))}
        </div>
    );
};

export default FileInput;
