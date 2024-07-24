import * as GitHub from '@octokit/rest'

export async function PushTokenToRepo(Repo: string, Token: string, SHA: string, GitHubToken: string, CurrentDate: Date) {
  const GitHubInstance = new GitHub.Octokit({ auth: GitHubToken })
  await GitHubInstance.repos.createOrUpdateFileContents({
    owner: Repo.split('/')[0],
    repo: Repo.split('/')[1],
    path: `${CurrentDate.getUTCFullYear()}/${CurrentDate.getUTCMonth()}/${CurrentDate.getUTCDate()}/${SHA}`,
    message: `Update for ${SHA}`,
    content: btoa(Token)
  })
}