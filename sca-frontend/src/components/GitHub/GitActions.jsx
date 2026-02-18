import GitActions from '../Git/GitActions';

export default function GitHubGitActions(props) {
  return <GitActions {...props} provider="github" />;
}
