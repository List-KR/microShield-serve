import * as GitHub from '@octokit/rest'

export async function PushTokenToRepo(Repo: string, Token: string, SHA: string, GitHubToken: string) {
  const GitHubInstance = new GitHub.Octokit({ auth: GitHubToken })
  await GitHubInstance.actions.createWorkflowDispatch({
    owner: Repo.split('/')[0],
    repo: Repo.split('/')[1],
    workflow_id: '.github/workflows/commit.yml',
    ref: 'main',
    inputs: {
      token: Token,
      sha: SHA
    }
  })
}