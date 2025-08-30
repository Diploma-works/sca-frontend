# Codebase Architecture

## High-Level Structure
```
src/
├── components/          # Reusable UI components
│   ├── Auth.jsx         # Authentication component
│   ├── Editor/          # Code editor functionality
│   ├── LeftSidebar/     # Sidebar with tools
│   ├── Problems/        # Issues/problems display  
│   ├── ProjectStructure/# File tree browser
│   ├── Statistics/      # Analytics dashboard
│   ├── SystemDesign/    # System architecture diagrams
│   └── ...
├── pages/              # Main page components
│   ├── AppLayout.jsx   # Main app layout
│   └── Main.jsx        # Main application page
├── hooks/              # Custom React hooks
├── themes/             # Theme configuration (light/dark)
├── utils/              # Utility functions
└── assets/             # Static assets (fonts, etc.)
```

## Key Architectural Patterns

### 1. Context-Based State Management
Each major feature uses React Context for state management:
- `TabsContext` - Editor tab management
- `SidebarContext` - Sidebar state
- `ProjectStructureContext` - File tree state  
- `ProblemsContext` - Issues/problems state

### 2. Component Composition
Main page composes features through context providers:
```jsx
<TabsContextProvider>
  <SidebarContextProvider>
    <ProjectStructureContextProvider>
      <ProblemsContextProvider>
        <LeftSidebar />
        <Editor />
      </ProblemsContextProvider>
    </ProjectStructureContextProvider>
  </SidebarContextProvider>
</TabsContextProvider>
```

### 3. Feature-Based Organization
Each major feature (Editor, Problems, SystemDesign, etc.) is organized as:
- Main component file
- Context provider for state
- Index file for clean exports
- Sub-components as needed

## Core Features Architecture

### Editor System
- **TabsContext**: Manages open tabs and active tab state
- **Editor.jsx**: Main editor container
- **EditorTab.jsx**: Individual tab component
- **HighlightedCodeBox.jsx**: Syntax-highlighted code display
- **PathBreadcrumbs.jsx**: File path navigation

### Sidebar System  
- **SidebarContext**: Manages which tool is active
- **LeftSidebar.jsx**: Main sidebar container
- **SidebarTool.jsx**: Individual tool wrapper
- Tools: Project Structure, Statistics, Problems, System Design

### Authentication
- Uses React Auth Kit for session management
- Cookie-based authentication
- Protected routes (though currently commented out)

### Theming System
- Centralized theme management in `src/themes/`
- Material-UI ThemeProvider integration
- Light/dark mode toggle functionality

## Data Flow

### 1. Application Initialization
1. App.jsx sets up routing and theme
2. AppLayout provides layout structure
3. Main.jsx initializes all context providers

### 2. Feature Communication
- Context providers handle feature-specific state
- Props passed down for configuration
- Custom hooks for reusable logic (useHorizontalResizing, useWindowSize)

### 3. Tool Integration
Tools in sidebar are configured in Main.jsx:
```javascript
const tools = [
  { title: "Файлы проекта", icon: <FolderOutlinedIcon />, component: <ProjectStructure /> },
  { title: "Статистика", icon: <QueryStatsRoundedIcon />, component: <Statistics /> },
  { title: "Проблемы", icon: <ErrorOutlineRoundedIcon />, component: <Problems /> },
  { title: 'Проектирование системы', icon: <WysiwygIcon />, component: <SystemDesign /> }
];
```

## Routing Structure
- **/** - Main app layout
  - **/sca-frontend** - Main application page
- **/sca-frontend/auth** - Authentication page

## Key Dependencies Integration
- **Material-UI**: Primary UI framework, extensive use of sx props
- **React Router**: Client-side routing with nested routes
- **@dnd-kit**: Drag and drop functionality (likely in SystemDesign)
- **@joint/core**: Diagramming for SystemDesign feature
- **React Auth Kit**: Authentication state management