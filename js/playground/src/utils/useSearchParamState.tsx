import { useSearchParams } from 'react-router-dom';

interface UseSearchParamStateOptions {
    parseBoolean?: boolean;
}

const useSearchParamState = <T extends string | number | boolean>(
    key: string,
    defaultValue: T,
    options?: UseSearchParamStateOptions
): [T, (value: T) => void] => {
    const [searchParams, setSearchParams] = useSearchParams();

    let value = searchParams.get(key) ?? defaultValue;
    if (options?.parseBoolean) {
        // empty string is considered true
        value = value === 'true' || value === '1' || value === '';
    }

    const setValue = (value: T) => {
        // keep other search params
        const newSearchParams = new URLSearchParams(searchParams.toString());
        if (value == null || (options?.parseBoolean && value === false)) {
            newSearchParams.delete(key);
        } else {
            newSearchParams.set(key, value.toString());
        }
        setSearchParams(newSearchParams);
    };

    return [value as T, setValue];
};

export default useSearchParamState;
