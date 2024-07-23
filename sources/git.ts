import * as GitHub from '@octokit/rest'

export async function PushTokenToRepo(Repo: string, Token: string, SHA: string, GitHubToken: string) {
  const GitHubInstance = new GitHub.Octokit({ auth: GitHubToken })
  await GitHubInstance.repos.createOrUpdateFileContents({
    owner: Repo.split('/')[0],
    repo: Repo.split('/')[1],
    path: SHA,
    message: `Update for ${SHA}`,
    content: Token,
    committer: {
      name: 'bot',
      email: ''
    },
    author: {
      name: 'bot',
      email: ''
    }
  })
}