import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import './Breadcrumbs.css';

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Define some custom labels if needed, otherwise capitalize the path segment
    const getBreadcrumbLabel = (path, index, paths) => {
        // Basic capitalization
        let label = path.charAt(0).toUpperCase() + path.slice(1);

        // If it's the last item and is a UUID/Number, maybe fetch the name or just show 'Details'
        // For this prototype, we'll keep it simple:
        if (index === paths.length - 1 && path.length > 15) {
            label = "Details";
        }

        return label;
    };

    return (
        <nav className="breadcrumbs" aria-label="breadcrumb">
            <Link to="/dashboard" className="breadcrumb-item home-link">
                <Home size={16} />
                <span>Dashboard</span>
            </Link>

            {pathnames.map((value, index) => {
                const last = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                // Skip 'dashboard' since it's hardcoded as Home
                if (value.toLowerCase() === 'dashboard') return null;

                return (
                    <React.Fragment key={to}>
                        <span className="breadcrumb-separator">
                            <ChevronRight size={14} />
                        </span>
                        {last ? (
                            <span className="breadcrumb-item active" aria-current="page">
                                {getBreadcrumbLabel(value, index, pathnames)}
                            </span>
                        ) : (
                            <Link to={to} className="breadcrumb-item">
                                {getBreadcrumbLabel(value, index, pathnames)}
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};

export default Breadcrumbs;
