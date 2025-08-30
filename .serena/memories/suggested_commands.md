# Suggested Commands for Development

## Core Development Commands

### Starting Development
```bash
npm start
```
- Starts the development server on http://localhost:3000
- Hot reloading enabled
- Uses react-scripts start

### Building for Production
```bash
npm run build
```
- Creates optimized production build in `build/` folder
- Uses react-scripts build

### Running Tests
```bash
npm test
```
- Runs test suite in interactive watch mode
- Uses Jest and React Testing Library
- Uses react-scripts test

### Deployment
```bash
npm run deploy
```
- Builds the project and deploys to GitHub Pages
- Automatically runs `npm run build` first (via predeploy script)
- Uses gh-pages package

## Code Quality Commands

### Linting
```bash
npx eslint src/
```
- Run ESLint on source code
- Uses configuration from `.eslintrc.json`
- Can also run: `npx eslint src/ --fix` to auto-fix issues

### Type Checking
No TypeScript configured currently - project uses JavaScript/JSX

## Package Management
```bash
npm install
```
- Install all dependencies

```bash
npm install <package-name>
```
- Add new dependency

```bash
npm install --save-dev <package-name>
```
- Add development dependency

## Windows-Specific Commands

### File System Navigation
```cmd
dir                 # List directory contents (Windows equivalent of ls)
cd <directory>      # Change directory
cd..               # Go up one directory
type <filename>     # Display file contents (Windows equivalent of cat)
```

### Search Commands
```cmd
findstr /s /i "search term" *.js     # Search for text in JS files (Windows equivalent of grep)
dir /s /b *.jsx                      # Find all JSX files recursively
```

### Git Commands
```bash
git status          # Check working tree status
git add .           # Stage all changes
git commit -m "message"  # Commit changes
git push            # Push to remote repository
git pull            # Pull latest changes
git branch          # List branches
git checkout <branch>    # Switch branch
```

## Useful Development Workflows

### After Making Changes
1. `npm test` - Ensure tests pass
2. `npx eslint src/` - Check for linting issues
3. `npm run build` - Verify build succeeds
4. `git add .` and `git commit` - Commit changes

### Before Deployment  
1. `npm run build` - Build production version
2. `npm run deploy` - Deploy to GitHub Pages