import { isObject } from 'lodash';
import { call } from './utils';

interface URLFieldParams {
    include?: string[];
    exclude?: string[];
}

interface URLTableParams {
    page?: number;
    pageSize?: number;
}

interface URLFilterParams {
    search?: { [key: string]: any };
}

export interface Booking {
    id: string;
    invoices: string[]; // rather invoiceIds ?
    amount: number;
    description: string;
    date: string; // datetime
    receiver: string;
    senderIban: string;
    senderBic: string;
    assignmentStatus: string;

    // new fields
    bookingReference?: string; // Transaktionsnummer / billingId ?
    bankAccount?: string; // rather bankAccountId ?
    costCenter?: string; // rather costCenterId ?
    // project?: string;
}

export interface Invoice {
    id: string;
    bookings: string[]; // rather bookingIds ?
    total: number;
    isExpense: boolean;
    taxRate: number;
    date: string;
    invoiceNumber: string;
    receiver: string;
    receiverIban: string;
    receiverBic: string;
    description: string;
    assignmentStatus: string;
    fileUrl?: string;
    derivedFields?: string[];
}

export interface Cluster {
    id: number;
    bookings: Booking[];
    invoices: Invoice[];

    bookingSum: number;
    invoiceSum: number;
    balance: number;
    status: string;
    clusterType: string;
    date: string;
    receiver: string;
    description: string;
}

export interface Match {
    bookingId: string;
    invoiceId: string;
    reasons: string[];
    score: number;
}

export interface CostCenter {
    id: string;
    number: string;
    name: string;
}

export interface BankAccount {
    id: string;
    name: string;
    iban: string;
    bic: string;
    owner: string;
    bankName: string;
}

export interface Contact {
    id: string;
    name: string;
    address: string;
}

export interface Settings {
    nextInvoiceNumber?: string;
}

export interface BatchTransferItem {
    id: string;
    receiver: string;
    receiverIban: string;
    receiverBic: string;
    total: number;
    description: string;
    derivedFields?: string[];
}

const isFile = (obj: any) => 'File' in window && obj instanceof File;
const isBlob = (obj: any) => 'Blob' in window && obj instanceof Blob;

const deepCamelCaseToSnakeCase = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map((v) => deepCamelCaseToSnakeCase(v));
    } else if (isObject(obj) && !isFile(obj) && !isBlob(obj)) {
        return Object.keys(obj).reduce((result: any, key) => {
            const value = (obj as any)[key];
            const newKey: string = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            result[newKey] = deepCamelCaseToSnakeCase(value);
            return result;
        }, {});
    } else {
        return obj;
    }
};

const deepSnakeCaseToCamelCase = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map((v) => deepSnakeCaseToCamelCase(v));
    } else if (isObject(obj) && !isFile(obj) && !isBlob(obj)) {
        return Object.keys(obj).reduce((result: any, key) => {
            const value: any = (obj as any)[key];
            const newKey: string = key.replace(/(_\w)/g, (k) => k[1].toUpperCase());
            result[newKey] = deepSnakeCaseToCamelCase(value);
            return result;
        }, {});
    } else {
        return obj;
    }
};

const extractFiles = (obj: any): any => {
    const files: any = {};
    Object.entries(obj).forEach(([key, value]) => {
        if (isFile(value)) {
            files[key] = value;
        }
    });
    return files;
};

class BaseAPIClient<T> {
    baseUrl: string = 'http://localhost:5001';
    resource: string = '';
    listDataKey: string = 'results';

    defaultHeaders: any = {
        Authorization: `Token 123`,
    };

    call(path: string, method: string = 'GET', options: any = {}): any {
        options['headers'] = { ...this.defaultHeaders, ...(options['headers'] || {}) };

        const parsedPath = new URL(path, this.baseUrl);

        if (options.include) {
            parsedPath.searchParams.set('include', options.include.join(','));
        }

        if (options.exclude) {
            parsedPath.searchParams.set('exclude', options.exclude.join(','));
        }

        if (options.page) {
            parsedPath.searchParams.set('page', (options.page + 1).toString());
        }

        if (options.pageSize) {
            parsedPath.searchParams.set('page_size', options.pageSize.toString());
        }

        if (options.search) {
            Object.entries(options.search).forEach(([key, value]) => {
                parsedPath.searchParams.set(key, value as any);
            });
        }

        return call(`${parsedPath.pathname}${parsedPath.search}`, method, options);
    }

    list(options: URLFieldParams & URLTableParams & URLFilterParams = {}): Promise<any> {
        return this.call(`/${this.resource}`, 'GET', options).then((data: any) => this.convertResponse(data));
    }

    create(data: Partial<T>, options: URLFieldParams & URLTableParams & URLFilterParams = {}): Promise<any> {
        const payload = deepCamelCaseToSnakeCase(data);
        return this.call(`/${this.resource}`, 'POST', {
            body: payload,
            files: extractFiles(payload),
            ...options,
        }).then((data: any) => this.convertResponse(data));
    }

    get(id: string, options: URLFieldParams & URLTableParams & URLFilterParams = {}): any {
        return this.call(`/${this.resource}/${id}`, 'GET', options).then((data: any) => this.convertResponse(data));
    }

    update(
        id: string,
        data: Partial<T>,
        partial: boolean = true,
        options: URLFieldParams & URLTableParams & URLFilterParams = {}
    ): Promise<any> {
        const method = partial ? 'PATCH' : 'PUT';
        const payload = deepCamelCaseToSnakeCase(data);

        return this.call(`/${this.resource}/${id}`, method, {
            body: payload,
            files: extractFiles(payload),
            ...options,
        }).then((data: any) => this.convertResponse(data));
    }

    delete(id: string): Promise<any> {
        return this.call(`/${this.resource}/${id}`, 'DELETE');
    }

    protected convertResponse(data: any): any {
        if (Array.isArray(data)) {
            return this.convertList(data);
        } else if (typeof data === 'object' && data[this.listDataKey]) {
            return this.convertPaginatedList(data);
        } else if (typeof data === 'object' && data !== null) {
            return this.convertObject(data);
        } else {
            return data;
        }
    }

    protected convertObject(data: any): T {
        return deepSnakeCaseToCamelCase(data);
    }

    protected convertList(data: any): T[] {
        return data.map((item: any) => this.convertObject(item));
    }

    protected convertPaginatedList(data: any): any {
        return {
            ...deepSnakeCaseToCamelCase(data),
            [this.listDataKey]: data[this.listDataKey].map((item: any) => this.convertObject(item)),
        };
    }
}

class ClusterClient extends BaseAPIClient<any> {
    resource = 'clusters';
}

class MatchClient extends BaseAPIClient<any> {
    resource = 'matches';
}

class InvoiceClient extends BaseAPIClient<any> {
    resource = 'invoices';

    putAssignments(invoiceId: string, bookingIds: string[]): Promise<any> {
        return this.call(`/${this.resource}/${invoiceId}/assignments`, 'PUT', {
            body: {
                bookings: bookingIds,
            },
        }).then((data: any) => this.convertResponse(data));
    }

    analyzeFile(invoiceFile: File): Promise<any> {
        return this.call(`/${this.resource}/analyze-file`, 'POST', {
            files: {
                file: invoiceFile,
            },
        }).then((data: any) => this.convertResponse(data));
    }
}

class BookingClient extends BaseAPIClient<any> {
    resource = 'bookings';

    putAssignments(bookingId: string, invoiceIds: string[]): Promise<any> {
        return this.call(`/${this.resource}/${bookingId}/assignments`, 'PUT', {
            body: {
                invoices: invoiceIds,
            },
        }).then((data: any) => this.convertResponse(data));
    }
}

class SettingsClient extends BaseAPIClient<any> {
    resource = 'settings';

    get(): any {
        return this.call(`/${this.resource}`, 'GET').then((data: any) => this.convertResponse(data));
    }
}

class CostCenterClient extends BaseAPIClient<any> {
    resource = 'cost-centers';
}

class BankAccountClient extends BaseAPIClient<any> {
    resource = 'bank-accounts';
}

class ContactClient extends BaseAPIClient<any> {
    resource = 'contacts';
}

class BatchTransferFileClient extends BaseAPIClient<any> {
    resource = 'batch-transfer-file';
}

class API {
    public settings: SettingsClient;
    public clusters: ClusterClient;
    public matches: MatchClient;
    public invoices: InvoiceClient;
    public bookings: BookingClient;
    public costCenters: CostCenterClient;
    public bankAccounts: BankAccountClient;
    public contacts: ContactClient;
    public batchTransferFile: BatchTransferFileClient;

    constructor() {
        this.settings = new SettingsClient();
        this.clusters = new ClusterClient();
        this.matches = new MatchClient();
        this.invoices = new InvoiceClient();
        this.bookings = new BookingClient();
        this.costCenters = new CostCenterClient();
        this.bankAccounts = new BankAccountClient();
        this.contacts = new ContactClient();
        this.batchTransferFile = new BatchTransferFileClient();
    }
}

export default new API();
