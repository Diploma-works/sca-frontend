import React from 'react';
import GitView from './GitView';
import { SidebarTool } from "../LeftSidebar";

const Git = ({ projectId, ...props }) => {
    return (
        <SidebarTool {...props}>
            <GitView projectId={projectId} />
        </SidebarTool>
    );
};

export default Git;
