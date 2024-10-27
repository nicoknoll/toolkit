import React from 'react';

type DynamicProps<T extends React.ElementType> = {
    component: T;
} & React.ComponentPropsWithRef<T>;

const Dynamic = <T extends React.ElementType = React.ElementType>({
    component: Component,
    ...props
}: DynamicProps<T>): React.ReactElement => {
    return <Component {...(props as React.ComponentPropsWithRef<T>)} />;
};

export default Dynamic as <T extends React.ElementType>(props: DynamicProps<T>) => React.ReactElement;
