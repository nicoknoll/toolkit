import { classnames } from './classnames';
import mergeRefs from './mergeRefs';

type AnyProps = Record<string, any>;

const mergeProps = (slotProps: AnyProps, childProps: AnyProps) => {
    // all child props should override
    const overrideProps = { ...childProps };

    for (const propName in childProps) {
        const slotPropValue = slotProps[propName];
        const childPropValue = childProps[propName];

        const isHandler = /^on[A-Z]/.test(propName);
        if (isHandler) {
            // if the handler exists on both, we compose them
            if (slotPropValue && childPropValue) {
                overrideProps[propName] = (...args: unknown[]) => {
                    childPropValue(...args);
                    slotPropValue(...args);
                };
            }
            // but if it exists only on the slot, we use only this one
            else if (slotPropValue) {
                overrideProps[propName] = slotPropValue;
            }
        }

        // merge refs
        if (propName === 'ref') {
            overrideProps[propName] = mergeRefs(slotPropValue, childPropValue);
        }

        // if it's `style`, we merge them
        else if (propName === 'style') {
            overrideProps[propName] = { ...slotPropValue, ...childPropValue };
        } else if (propName === 'className') {
            overrideProps[propName] = classnames(slotPropValue, childPropValue);
        }
    }

    return { ...slotProps, ...overrideProps };
};

export default mergeProps;
