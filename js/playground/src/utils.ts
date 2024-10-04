const API_URL = 'http://localhost:5001';

class APIError extends Error {
    payload: any;

    constructor(message: string, payload: any = undefined) {
        super(message);
        this.name = 'APIError';
        this.payload = payload;
    }
}

const buildFormData = (formData: FormData, data: object, parentKey: string | undefined = undefined) => {
    if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)) {
        Object.keys(data).forEach((key: string) => {
            // @ts-ignore
            buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
        });
    } else if (data == null) {
        // don't send null values
        // formData.append(parentKey, '');
    } else {
        // @ts-ignore
        formData.append(parentKey, data);
    }
};

export const call = async (path: string, method = 'GET', options: any = {}) => {
    if (options.files && Object.keys(options.files).length > 0) {
        const formData = new FormData();

        buildFormData(formData, options.body || {});

        for (const key in options.files) {
            formData.append(key, options.files[key]);
        }
        options.body = formData;
    } else if (options.body && typeof options.body === 'object') {
        options.body = JSON.stringify(options.body);
        options.headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        };
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...(options || {}),
        method,
        credentials: 'include',
    });

    if (!response.ok) {
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {}

        throw new APIError(`Ein Fehler ist aufgetreten: ${response.statusText} (${response.status})\n\n${text}`, data);
    }

    const contentType = response.headers.get('content-type');

    if (response.status === 204) {
        return null;
    } else if (contentType && contentType.indexOf('application/json') !== -1) {
        return await response.json();
    } else {
        return await response.text();
    }
};
