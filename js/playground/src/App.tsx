import TestForm from './pages/TestForm.tsx';
import TestTable from './pages/TestTable.tsx';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';

const Overview = () => {
    return (
        <div>
            <Link to="/forms" className="text-theme-600 underline">
                Forms
            </Link>
            <br />
            <Link to="/tables" className="text-theme-600 underline">
                Tables
            </Link>
        </div>
    );
};

const App = () => {
    return (
        <div className="p-12">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Overview />} />
                    <Route path="/forms" element={<TestForm />} />
                    <Route path="/tables" element={<TestTable />} />
                </Routes>
            </BrowserRouter>

            <Toaster />
        </div>
    );
};

export default App;
