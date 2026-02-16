import GitActions from '../Git/GitActions';

// Backward compatibility: existing imports from src/components/GitHub/GitActions.jsx
// will still work and render the unified component.
export default function GitHubGitActions(props) {
  return <GitActions {...props} provider="github" />;
}
