import * as React from 'react';
import client, { BankAccount, Booking, Cluster, Contact, CostCenter, Invoice, Match, Settings } from './api.ts';
import { useEffect, useState } from 'react';

interface Data {
    settings: Settings;
    clusters: Cluster[];
    matches: Match[];
    invoices: Invoice[];
    bookings: Booking[];
    costCenters: CostCenter[];
    bankAccounts: BankAccount[];
    contacts: Contact[];
}

export const fetchData = async (keys?: string[]): Promise<Data> => {
    const fetchers = {
        settings: client.settings.get(),
        clusters: client.clusters.list({ include: ['bookings', 'invoices'], pageSize: 1000 }),
        matches: client.matches.list({ pageSize: 1000 }),
        invoices: client.invoices.list({ pageSize: 2000 }),
        bookings: client.bookings.list({ pageSize: 2000 }),
        costCenters: client.costCenters.list({ pageSize: 2000 }),
        bankAccounts: client.bankAccounts.list({ pageSize: 1000 }),
        contacts: client.contacts.list({ pageSize: 2000 }),
    };

    if (keys == null) {
        keys = Object.keys(fetchers);
    }

    // all keys should be filled, only the ones in keys should actually be fetched
    return Object.fromEntries(
        await Promise.all(
            Object.entries(fetchers).map(async ([key, fetcher]) => {
                if (keys.includes(key)) {
                    const data = await fetcher;
                    // return results it exists as key in data
                    if (data.results) {
                        return [key, data.results];
                    }

                    return [key, data];
                }
                return [key, []];
            })
        )
    );
};

export const useFetchedData = (): [Data, { isLoading?: boolean; refetch: (keys?: string[]) => Promise<Data> }] => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<Data>({
        settings: {},
        clusters: [],
        matches: [],
        invoices: [],
        bookings: [],
        costCenters: [],
        bankAccounts: [],
        contacts: [],
    });

    useEffect(() => {
        setIsLoading(true);
        fetchData().then((data) => {
            setData(data);
            setIsLoading(false);
        });
    }, []);

    return [
        data,
        {
            isLoading,
            refetch: (keys?: string[]) => {
                setIsLoading(true);
                return fetchData(keys).then((data) => {
                    setData(data);
                    setIsLoading(false);
                    return data;
                });
            },
        },
    ];
};

const DataContext = React.createContext<[Data, { refetch: (keys?: string[]) => Promise<Data>; isLoading?: boolean }]>([
    {
        settings: {},
        clusters: [],
        matches: [],
        invoices: [],
        bookings: [],
        costCenters: [],
        bankAccounts: [],
        contacts: [],
    },
    { refetch: (keys?: string[]) => Promise.resolve({} as Data), isLoading: false },
]);

export const DataProvider = ({
    children,
    data,
    isLoading,
    refetch,
}: {
    children: React.ReactNode;
    data: Data;
    refetch: (keys?: string[]) => Promise<Data>;
    isLoading?: boolean;
}) => {
    return <DataContext.Provider value={[data, { isLoading, refetch }]}>{children}</DataContext.Provider>;
};

export const useData = () => React.useContext(DataContext);
