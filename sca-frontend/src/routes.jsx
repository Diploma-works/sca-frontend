import { Navigate } from "react-router-dom";

import { AuthPage } from "@/pages/auth/AuthPage";
import { RootLayout } from "@/pages/RootLayout";
import { AllProjectsPage } from "@/pages/projects/AllProjectsPage";
import { ProjectPage } from "@/pages/projects/$id/ProjectPage";
import { ProjectCrumb } from "@/pages/projects/$id/ProjectCrumb";
import { GitHubPage } from "@/pages/github/GitHubPage";

export const routes = [
    {
        path: "/auth",
        Component: AuthPage,
        handle: { hideFromSidebar: true },
    },
    {
        Component: RootLayout,
        children: [
            {
                path: "projects",
                handle: { title: "Проекты" },
                children: [
                    {
                        index: true,
                        Component: AllProjectsPage, // не layout, поскольку AllProjects и Project не имеют общего UI
                        handle: { hideFromSidebar: true },
                    },
                    {
                        path: ":id",
                        Component: ProjectPage,
                        handle: { hideFromSidebar: true, CrumbComponent: ProjectCrumb },
                    },
                ],
            },
            {
                path: "github",
                Component: GitHubPage,
                handle: { title: "Github" },
            },
            // TODO: Сделать "/" главной страницей, добавить route для ошибок
            {
                path: "*",
                element: <Navigate to="/projects" replace/>,
                handle: { hideFromSidebar: true },
            },
        ]
    },
];

const createNavRoutes = (routes, parentPath = "/") => routes.flatMap((route) => {
    if (!route.path) return route.children ? createNavRoutes(route.children, parentPath) : [];

    const fullPath = parentPath + route.path.replace(/^\//, "");
    if (route.handle?.hideFromSidebar) return route.children ? createNavRoutes(route.children, fullPath) : [];

    const children = route.children ? createNavRoutes(route.children, fullPath) : [];
    return [route, ...children];
});

export const navRoutes = createNavRoutes(routes);