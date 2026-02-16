import React from 'react';
import GitActions from '../Git/GitActions';

export default function GitLabGitActions(props) {
  return <GitActions {...props} provider="gitlab" />;
}
