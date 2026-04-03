import { Navigate } from "react-router-dom";

import Auth from "@/components/Auth";
import Projects from "@/components/Projects";
import GitHubPage from "@/pages/GitHubPage";
import Main from "@/components/Main";
import App from "@/App";
import { ProjectCrumb } from "@/components/ProjectCrumb";

export const routes = [
    {
        path: "/auth",
        Component: Auth,
        handle: { hideFromSidebar: true },
    },
    {
        Component: App,
        children: [
            {
                path: "projects",
                handle: { title: "Проекты" },
                children: [
                    {
                        index: true, // сделано так, поскольку Projects и Main не имеют общего UI
                        Component: Projects,
                        handle: { hideFromSidebar: true },
                    },
                    {
                        path: ":id",
                        Component: Main,
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