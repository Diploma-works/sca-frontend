# Code Style and Conventions

## File Structure
- **Components**: Organized in `src/components/` with feature-based folders
- **Pages**: Main page components in `src/pages/`
- **Hooks**: Custom hooks in `src/hooks/`
- **Themes**: Theme configurations in `src/themes/`
- **Utils**: Utility functions in `src/utils/`
- **Assets**: Fonts and static assets in `src/assets/`

## Component Organization
Each major component has its own folder containing:
- Main component file (e.g., `Editor.jsx`)
- Context provider (e.g., `EditorContext.jsx`) 
- Index file for exports (`index.js`)
- Related sub-components and utilities

## Naming Conventions
- **Components**: PascalCase (e.g., `SystemDesign.jsx`)
- **Files**: PascalCase for components, camelCase for utilities
- **Folders**: PascalCase for component folders
- **Variables/Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE where appropriate

## Code Style
- **Language**: JavaScript (JSX) - primarily `.jsx` files
- **Imports**: ES6 imports with organized grouping:
  1. React imports first
  2. Third-party libraries  
  3. Internal components/utilities
- **Export**: Default exports for main components
- **Formatting**: Consistent indentation and spacing

## ESLint Configuration
Uses Create React App's default ESLint configuration with custom rules:
- Extends: `"react-app"` and `"react-app/jest"`
- Custom rules to allow webpack loader syntax
- TypeScript support configured for `.ts/.tsx` files

## Component Patterns
- **Functional Components**: Uses hooks pattern exclusively
- **Context Pattern**: Heavy use of React Context for state management
- **Provider Pattern**: Wrapping components with context providers
- **Custom Hooks**: Extracted reusable logic (e.g., `useHorizontalResizing`, `useWindowSize`)

## State Management
- **React Context**: Primary state management approach
- **useState/useEffect**: Local component state
- **React Auth Kit**: Authentication state management

## Styling Approach
- **Material-UI**: Primary styling through MUI's sx prop
- **CSS-in-JS**: Emotion (via MUI)
- **Theming**: Centralized theme system with light/dark modes
- **Custom CSS**: Global styles in `index.css`

## Comments
- Minimal inline comments
- TODO comments for future improvements
- JSDoc-style comments where needed for complex logic