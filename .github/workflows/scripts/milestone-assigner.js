const { Octokit } = require('@octokit/action');

const octokit = new Octokit();

const getCurrentMilestone = async (owner, repo) => {
  const data = await octokit.rest.issues.listMilestones({
    owner,
    repo,
    state: 'open',
  });

  return data[0];
};

const start = async () => {
  const payload = require(process.env.GITHUB_EVENT_PATH);
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
  const { number } = payload?.issue || payload?.pull_request;
  const currentMilestone = await getCurrentMilestone(owner, repo);

  await octokit.rest.issues.update({
    owner,
    repo,
    issue_number: number,
    milestone: currentMilestone?.number || null,
  });
};

start();
