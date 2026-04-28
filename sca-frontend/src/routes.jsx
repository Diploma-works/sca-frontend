import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import RequireAuth from '@auth-kit/react-router/RequireAuth';

import Auth from './components/Auth';
import Main from './components/Main';
import Projects from './components/Projects';
import GitHubPage from './pages/GitHub/GitHubPage';
import GitLabPage from './pages/GitLab/GitLabPage';
import BitbucketPage from './pages/Bitbucket/BitbucketPage';

const ProtectedRoute = ({ children }) => (
    <RequireAuth fallbackPath="/auth">
        {children}
    </RequireAuth>
);

const AppRoutes = () => (
    <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
        <Route path="/github" element={<ProtectedRoute><GitHubPage /></ProtectedRoute>} />
        <Route path="/gitlab" element={<ProtectedRoute><GitLabPage /></ProtectedRoute>} />
        <Route path="/bitbucket" element={<ProtectedRoute><BitbucketPage /></ProtectedRoute>} />
        <Route path="/projects/:id" element={<ProtectedRoute><Main /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="*" element={<ProtectedRoute><Main /></ProtectedRoute>} />
    </Routes>
);

export default AppRoutes;
