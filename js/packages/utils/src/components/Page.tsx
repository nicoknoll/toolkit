import { ReactNode, useEffect } from 'react';

export const useMetaTag = (name: string): [() => string, (value: string) => void] => {
    const getValue = () => {
        const metaTag = document.querySelector(`meta[name="${name}"]`);
        return metaTag?.getAttribute('content') || '';
    };

    const setValue = (value: string) => {
        const metaTag = document.querySelector(`meta[name="${name}"]`);
        if (metaTag) {
            metaTag.setAttribute('content', value);
        } else {
            const newMetaTag = document.createElement('meta');
            newMetaTag.name = name;
            newMetaTag.content = value;
            document.head.appendChild(newMetaTag);
        }
    };

    return [getValue, setValue];
};

export const useDocumentTitle = (): [() => string, (value: string) => void] => {
    const getValue = () => {
        const titleTag = document.querySelector('title');
        return titleTag?.innerHTML || document.title || '';
    };

    const setValue = (value: string) => {
        const titleTag = document.querySelector('title');
        if (titleTag) {
            titleTag.innerHTML = value;
        } else {
            const newTitleTag = document.createElement('title');
            newTitleTag.innerHTML = value;
            document.head.appendChild(newTitleTag);
        }
        document.title = value;
    };

    return [getValue, setValue];
};

const Page = ({
    title,
    themeColor,
    children,
    isLoading = false,
    fallback, // used when it is loading
}: {
    title?: string;
    themeColor?: string;
    children?: ReactNode;
    isLoading?: boolean;
    fallback?: ReactNode;
}) => {
    const [, setThemeColor] = useMetaTag('theme-color');
    const [, setTitle] = useDocumentTitle();

    useEffect(() => {
        if (title != null) setTitle(title);
    }, [title]);

    useEffect(() => {
        if (themeColor != null) {
            setThemeColor(themeColor || '#ffffff');
            document.body.style.backgroundColor = themeColor || '';
        }
    }, [themeColor]);

    if (isLoading) {
        return fallback || null;
    }

    return children;
};

export default Page;
