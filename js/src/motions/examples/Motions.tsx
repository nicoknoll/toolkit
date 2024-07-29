import { animate, AnimatePresence, motion, useInView, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { LoaderIcon } from 'lucide-react';
import useMeasure from 'react-use-measure';

const buttonLabels: any = {
    idle: 'Send me a login link',
    loading: <LoaderIcon size={16} color="rgba(255, 255, 255, 0.65)" />,
    success: 'Login link sent!',
};

function Card({ value }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            {open ? (
                <motion.div
                    className="w-[100vw] h-[100vh] grid place-items-center inset-0 absolute"
                    onClick={() => setOpen(false)}
                    layoutId="expandable-card"
                    style={{ background: value }}
                    // layout="position"
                >
                    <motion.div layout="position">
                        <motion.h2 className="text-2xl text-theme-600" layoutId="expandable-card-h">
                            Expanded {value}
                        </motion.h2>
                        <p>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit.Voluptate aliquam molestiae ratione
                            sint magnam sequi fugiat ullam earum distinctio fuga iure, ad odit repudiandae modi est
                            alias ipsum aperiam.Culpa?
                        </p>
                    </motion.div>
                </motion.div>
            ) : (
                <motion.div
                    onClick={() => setOpen(true)}
                    className="w-96 grid"
                    layoutId="expandable-card"
                    style={{ background: value }}
                    // layout="position"
                >
                    <motion.h1 layoutId="expandable-card-h">{value}</motion.h1>
                </motion.div>
            )}
        </>
    );
}

const SmoothButton = () => {
    const [buttonState, setButtonState] = useState('idle');

    return (
        <button
            className="bg-theme-600 text-white rounded-lg px-3 py-1.5 h-9 w-44 text-center flex justify-center items-center"
            disabled={buttonState !== 'idle'}
            onClick={() => {
                // This code is just a placeholder
                setButtonState('loading');

                setTimeout(() => {
                    setButtonState('success');
                }, 1750);

                setTimeout(() => {
                    setButtonState('idle');
                }, 3500);
            }}
        >
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                    transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                    initial={{ opacity: 0, y: buttonState === 'loading' ? -25 : 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: buttonState === 'loading' ? -25 : 25 }}
                    key={buttonState}
                >
                    {buttonLabels[buttonState]}
                </motion.span>
            </AnimatePresence>
        </button>
    );
};
const AnimatedNumber = ({ value }) => {
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -50 },
    };

    return (
        <AnimatePresence mode="popLayout">
            <motion.span
                key={value}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={containerVariants}
                transition={{ duration: 0.5, bounce: 0.5, type: 'spring' }}
                style={{ display: 'inline-block' }}
            >
                {value}
            </motion.span>
        </AnimatePresence>
    );
};

const DateCounter = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentDate(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatWithLeadingZero = (number) => (number < 10 ? `0${number}` : number.toString());

    const hours = formatWithLeadingZero(currentDate.getHours());
    const minutes = formatWithLeadingZero(currentDate.getMinutes());
    const seconds = formatWithLeadingZero(currentDate.getSeconds());

    return (
        <div
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
            className="tabular-nums"
        >
            <div style={{ fontSize: '3rem', display: 'flex' }}>
                <AnimatedNumber value={hours[0]} />
                <AnimatedNumber value={hours[1]} />:
                <AnimatedNumber value={minutes[0]} />
                <AnimatedNumber value={minutes[1]} />:
                <AnimatedNumber value={seconds[0]} />
                <AnimatedNumber value={seconds[1]} />
            </div>
        </div>
    );
};
type CounterProps = {
    from: number;
    to: number;
};

function AnimatedCounter({ from, to }: CounterProps) {
    const count = useMotionValue(from);
    const rounded = useTransform(count, (latest) => {
        return Math.round(latest);
    });
    const ref = useRef(null);
    const inView = useInView(ref);

    // while in view animate the count
    useEffect(() => {
        if (inView) {
            animate(count, to, { duration: 2 });
        }
    }, [count, inView, to]);

    return <motion.span ref={ref}>{rounded}</motion.span>;
}

const FamilyDrawer = () => {
    const [state, setState] = useState(0);

    const [ref, bounds] = useMeasure();

    return (
        <>
            <Card value="red" />
            <DateCounter />
            <AnimatedCounter from={0} to={200} />+
            <button className="button" onClick={() => setState(1)}>
                Toggle height
            </button>
            <AnimatePresence initial={false}>
                <motion.div
                    // initial={false}
                    // animate={{ height: bounds.height }}
                    // transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
                    className="bg-white border border-neutral-200 fixed bottom-20 overflow-hidden"
                    style={{ borderRadius: 28, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' }}
                    animate={
                        state === 2
                            ? { inset: 0, bottom: 0, width: '100%', height: '100%', borderRadius: 0 }
                            : { width: '400px', height: bounds.height }
                    }
                    transition={{ type: 'spring', duration: state === 2 ? 10 : 0.5, bounce: 0 }}
                    layout
                >
                    <motion.div
                        ref={ref}
                        className="flex flex-col gap-4 p-6 w-full"
                        key={state}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        // exit={{ opacity: 0 }}
                        transition={{ type: 'spring', duration: 0.6, bounce: 0 }}
                    >
                        {state === 0 && (
                            <>
                                <h1>Something else</h1>
                                <p>Some other content that doesn't change the height of the drawer.</p>
                            </>
                        )}

                        {state === 1 && (
                            <>
                                <h1 className="font-medium text-lg">Fake Family Drawer</h1>
                                <p>
                                    This is a fake family drawer. Animating height is tricky, but satisfying when it
                                    works.
                                </p>

                                <p>
                                    This extra content will change the height of the drawer. Some even more content to
                                    make the drawer taller and taller and taller...
                                </p>

                                <motion.button
                                    layoutId="button"
                                    className="rounded-full bg-neutral-200 text-neutral-900 font-medium px-4 py-2 hover:bg-neutral-300 transition-colors"
                                    initial={{ scale: 1 }}
                                    whileHover={{ scale: 1 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: 'spring', duration: 0.6, bounce: 0.5 }}
                                    onClick={() => setState(2)}
                                >
                                    Click me
                                </motion.button>
                            </>
                        )}

                        {state === 2 && (
                            <>
                                <h1>Full screen</h1>
                                <p>This is the full screen content.</p>

                                <motion.button
                                    layoutId="button"
                                    className="rounded-full bg-error-50 text-error-900 font-medium px-4 py-2 hover:bg-error-100 transition-colors"
                                    initial={{ scale: 1 }}
                                    whileHover={{ scale: 1 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: 'spring', duration: 0.6, bounce: 0.5 }}
                                    onClick={() => setState(0)}
                                >
                                    Close
                                </motion.button>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </>
    );
};

const Motions = () => {
    const [shouldAnimate, setShouldAnimate] = useState(false);

    return (
        <div className="flex flex-col gap-40 items-center">
            <FamilyDrawer />

            <SmoothButton />

            <motion.button className="button" onClick={() => setShouldAnimate((s) => !s)}>
                Animate
            </motion.button>
            {/*<motion.div*/}
            {/*    onClick={() => setShouldAnimate((s) => !s)}*/}
            {/*    // animate={{ scale: shouldAnimate ? 1.5 : 1, y: shouldAnimate ? -40 : 0 }}*/}
            {/*    className="bg-theme-400 rounded-lg"*/}
            {/*    style={*/}
            {/*        shouldAnimate*/}
            {/*            ? { position: 'fixed', inset: 0, width: '100%', height: '100%' }*/}
            {/*            : { height: 48, width: 48 }*/}
            {/*    }*/}
            {/*    layout*/}
            {/*/>*/}

            {shouldAnimate ? (
                <motion.div layoutId="rectangle" className="bg-theme-400 w-20 h-20" style={{ borderRadius: 12 }} />
            ) : (
                <motion.div layoutId="rectangle" className="bg-theme-600 w-40 h-40" style={{ borderRadius: 12 }} />
            )}
        </div>
    );
};

export default Motions;
