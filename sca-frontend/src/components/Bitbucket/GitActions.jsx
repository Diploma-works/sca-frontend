import React from 'react';
import GitActions from '../Git/GitActions';

export default function BitbucketGitActions(props) {
  return <GitActions {...props} provider="bitbucket" />;
}
