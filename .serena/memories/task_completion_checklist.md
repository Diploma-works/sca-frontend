# Task Completion Checklist

When completing any development task on this project, follow these steps:

## Code Quality Checks

### 1. Linting
```bash
npx eslint src/
```
- Fix any linting errors or warnings
- Use `npx eslint src/ --fix` for auto-fixable issues

### 2. Testing
```bash
npm test
```
- Ensure all existing tests pass
- Add new tests for new functionality if applicable
- Tests use Jest and React Testing Library

### 3. Build Verification
```bash
npm run build
```
- Verify the production build completes without errors
- Check that no build warnings are introduced

## Code Review Checks

### 4. Component Integration
- Ensure new components follow the established folder structure
- Check that components are properly exported in index files
- Verify context providers are correctly implemented where needed

### 5. Styling Consistency
- Use Material-UI's sx prop for styling
- Follow the established theming system (light/dark mode support)
- Ensure responsive design principles are maintained

### 6. Import Organization
- Group imports properly: React → third-party → internal
- Remove unused imports
- Use relative imports for internal components

## Functionality Checks

### 7. Cross-Feature Testing
- Test integration with existing features (Editor, Problems, Statistics, SystemDesign)
- Verify routing works correctly
- Check authentication flow if auth-related changes were made

### 8. Browser Testing
- Test in development mode (`npm start`)
- Verify production build works (`npm run build` then serve locally)

## Version Control

### 9. Git Workflow
```bash
git status              # Check what files changed
git add .               # Stage changes  
git commit -m "descriptive message"  # Commit with clear message
```

### 10. Pre-Deployment (if deploying)
```bash
npm run build          # Build production version
npm run deploy         # Deploy to GitHub Pages
```

## Documentation

### 11. Update Documentation
- Update component documentation if needed
- Add comments for complex logic
- Update README if major features were added

## Final Verification
- [ ] No console errors in browser dev tools
- [ ] All ESLint issues resolved
- [ ] Tests passing
- [ ] Production build successful
- [ ] Changes committed with clear message
- [ ] Feature works as expected in both light and dark themes