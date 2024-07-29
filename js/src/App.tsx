import TestForm, { TestFormFieldValues } from './forms/examples/TestForm.tsx';
import Motions from './motions/examples/Motions.tsx';

const Route = ({ path, children }: { path: string; children: any }) => {
    return window.location.pathname === path ? children : null;
};

const App = () => {
    return (
        <div className="p-12">
            <Route path="/">
                <a href="/forms" className="text-theme-600 underline">
                    Forms
                </a>
                <br />
                <a href="/motions" className="text-theme-600 underline">
                    Motions
                </a>
            </Route>
            <Route path="/forms">
                <TestForm />
            </Route>
            <Route path="/motions">
                <Motions />
            </Route>
        </div>
    );
};

export default App;
