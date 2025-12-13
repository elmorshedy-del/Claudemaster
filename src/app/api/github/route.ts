import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from 'octokit';

// Initialize Octokit with token
function getOctokit(token: string) {
  return new Octokit({ auth: token });
}

// GET - List branches, repositories, or get file content
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token') || request.headers.get('x-github-token');
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const action = searchParams.get('action') || 'branches';

    if (!token) {
      return NextResponse.json(
        { error: 'Missing required parameter: token' },
        { status: 400 }
      );
    }

    // Actions that require a specific repository
    if (!owner || !repo) {
      const repoRequiredActions = ['branches', 'tree', 'file', 'validateRepo'];
      if (repoRequiredActions.includes(action)) {
        return NextResponse.json(
          { error: 'Missing required parameters: token, owner, repo' },
          { status: 400 }
        );
      }
    }

    const octokit = getOctokit(token);

    switch (action) {
      case 'listRepos': {
        type RepoSource = {
          id: number;
          name: string;
          full_name: string;
          owner?: { login?: string | null };
          private: boolean;
        };

        const { data: userRepos } = await octokit.rest.repos.listForAuthenticatedUser({
          per_page: 100,
          sort: 'pushed',
        });

        const org = searchParams.get('org');
        const userRepoSummaries = userRepos.map(r => ({
          id: r.id,
          name: r.name,
          fullName: r.full_name,
          owner: r.owner?.login,
          private: r.private,
        }));

        let orgRepos: RepoSource[] = [];

        if (org) {
          const { data } = await octokit.rest.repos.listForOrg({
            org,
            per_page: 100,
            sort: 'pushed',
          });
          orgRepos = data;
        }

        const orgRepoSummaries = orgRepos.map(r => ({
          id: r.id,
          name: r.name,
          fullName: r.full_name,
          owner: r.owner?.login,
          private: r.private,
        }));

        const repos = [...userRepoSummaries, ...orgRepoSummaries];

        return NextResponse.json({ repos });
      }

      case 'validateRepo': {
        if (!owner || !repo) {
          return NextResponse.json({ error: 'Owner and repo are required' }, { status: 400 });
        }

        const { data: repoData } = await octokit.rest.repos.get({
          owner,
          repo,
        });

        return NextResponse.json({
          repository: {
            id: repoData.id,
            name: repoData.name,
            fullName: repoData.full_name,
            owner: repoData.owner?.login,
            private: repoData.private,
          },
        });
      }

      case 'branches': {
        if (!owner || !repo) {
          return NextResponse.json({ error: 'Owner and repo are required' }, { status: 400 });
        }

        const { data: branches } = await octokit.rest.repos.listBranches({
          owner,
          repo,
        });
        const { data: repoData } = await octokit.rest.repos.get({
          owner,
          repo,
        });
        return NextResponse.json({
          branches: branches.map(b => ({
            name: b.name,
            sha: b.commit.sha,
            isDefault: b.name === repoData.default_branch,
          })),
        });
      }

      case 'tree': {
        if (!owner || !repo) {
          return NextResponse.json({ error: 'Owner and repo are required' }, { status: 400 });
        }

        const branch = searchParams.get('branch') || 'main';
        const { data: branchData } = await octokit.rest.repos.getBranch({
          owner,
          repo,
          branch,
        });
        const { data: tree } = await octokit.rest.git.getTree({
          owner,
          repo,
          tree_sha: branchData.commit.sha,
          recursive: 'true',
        });
        return NextResponse.json({ tree: tree.tree });
      }

      case 'file': {
        if (!owner || !repo) {
          return NextResponse.json({ error: 'Owner and repo are required' }, { status: 400 });
        }

        const path = searchParams.get('path');
        const branch = searchParams.get('branch') || 'main';
        if (!path) {
          return NextResponse.json({ error: 'Path required' }, { status: 400 });
        }
        const { data } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path,
          ref: branch,
        });
        if (Array.isArray(data) || data.type !== 'file') {
          return NextResponse.json({ error: 'Not a file' }, { status: 400 });
        }
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        return NextResponse.json({ path, content, sha: data.sha });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('GitHub GET error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
}

// POST - Create branch, commit files, create PR, merge, delete
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, token, owner, repo, ...params } = body;

    // Also check environment variables as fallback
    const githubToken = token || process.env.GITHUB_TOKEN;
    const repoOwner = owner || process.env.GITHUB_REPO_OWNER;
    const repoName = repo || process.env.GITHUB_REPO_NAME;

    if (!githubToken) {
      return NextResponse.json(
        { error: 'GitHub token not provided. Set GITHUB_TOKEN in environment or pass token in request.' },
        { status: 401 }
      );
    }

    if (!repoOwner || !repoName) {
      return NextResponse.json(
        { error: 'Repository owner and name required. Set GITHUB_REPO_OWNER and GITHUB_REPO_NAME in environment or pass in request.' },
        { status: 400 }
      );
    }

    const octokit = getOctokit(githubToken);

    switch (action) {
      // Create a new branch
      case 'createBranch': {
        const { branchName, fromBranch = 'main' } = params;
        if (!branchName) {
          return NextResponse.json({ error: 'Branch name required' }, { status: 400 });
        }

        // Get the SHA of the source branch
        const { data: refData } = await octokit.rest.git.getRef({
          owner: repoOwner,
          repo: repoName,
          ref: `heads/${fromBranch}`,
        });

        // Create the new branch
        await octokit.rest.git.createRef({
          owner: repoOwner,
          repo: repoName,
          ref: `refs/heads/${branchName}`,
          sha: refData.object.sha,
        });

        return NextResponse.json({
          success: true,
          branch: {
            name: branchName,
            sha: refData.object.sha,
          },
        });
      }

      // Commit multiple files to a branch
      case 'commit': {
        const { branch, files, message } = params;
        if (!branch || !files || !Array.isArray(files) || files.length === 0) {
          return NextResponse.json(
            { error: 'Branch, files array, and message required' },
            { status: 400 }
          );
        }

        // Get the current commit SHA for the branch
        const { data: refData } = await octokit.rest.git.getRef({
          owner: repoOwner,
          repo: repoName,
          ref: `heads/${branch}`,
        });
        const currentCommitSha = refData.object.sha;

        // Get the tree SHA from the current commit
        const { data: commitData } = await octokit.rest.git.getCommit({
          owner: repoOwner,
          repo: repoName,
          commit_sha: currentCommitSha,
        });
        const baseTreeSha = commitData.tree.sha;

        // Create blobs for each file
        const treeItems = await Promise.all(
          files.map(async (file: { path: string; content: string }) => {
            const { data: blob } = await octokit.rest.git.createBlob({
              owner: repoOwner,
              repo: repoName,
              content: Buffer.from(file.content).toString('base64'),
              encoding: 'base64',
            });
            return {
              path: file.path,
              mode: '100644' as const,
              type: 'blob' as const,
              sha: blob.sha,
            };
          })
        );

        // Create a new tree
        const { data: newTree } = await octokit.rest.git.createTree({
          owner: repoOwner,
          repo: repoName,
          base_tree: baseTreeSha,
          tree: treeItems,
        });

        // Create a new commit
        const { data: newCommit } = await octokit.rest.git.createCommit({
          owner: repoOwner,
          repo: repoName,
          message: message || `Claude Coder: Update ${files.length} file(s)`,
          tree: newTree.sha,
          parents: [currentCommitSha],
        });

        // Update the branch reference
        await octokit.rest.git.updateRef({
          owner: repoOwner,
          repo: repoName,
          ref: `heads/${branch}`,
          sha: newCommit.sha,
        });

        return NextResponse.json({
          success: true,
          commit: {
            sha: newCommit.sha,
            message: newCommit.message,
            url: newCommit.html_url,
          },
          filesChanged: files.length,
        });
      }

      // Create a pull request
      case 'createPR': {
        const { title, body: prBody, head, base = 'main' } = params;
        if (!title || !head) {
          return NextResponse.json(
            { error: 'Title and head branch required' },
            { status: 400 }
          );
        }

        const { data: pr } = await octokit.rest.pulls.create({
          owner: repoOwner,
          repo: repoName,
          title,
          body: prBody || '',
          head,
          base,
        });

        return NextResponse.json({
          success: true,
          pr: {
            number: pr.number,
            url: pr.html_url,
            title: pr.title,
          },
        });
      }

      // Merge a pull request or branch
      case 'merge': {
        const { prNumber, branchName } = params;

        if (prNumber) {
          // Merge PR
          await octokit.rest.pulls.merge({
            owner: repoOwner,
            repo: repoName,
            pull_number: prNumber,
          });
          return NextResponse.json({ success: true, merged: 'pr', prNumber });
        } else if (branchName) {
          // Merge branch directly into main
          const { data: mergeResult } = await octokit.rest.repos.merge({
            owner: repoOwner,
            repo: repoName,
            base: 'main',
            head: branchName,
            commit_message: `Merge branch '${branchName}' via Claude Coder`,
          });
          
          // Delete the branch after merge
          try {
            await octokit.rest.git.deleteRef({
              owner: repoOwner,
              repo: repoName,
              ref: `heads/${branchName}`,
            });
          } catch (e) {
            // Branch might already be deleted
          }

          return NextResponse.json({
            success: true,
            merged: 'branch',
            branchName,
            commitSha: mergeResult.sha,
          });
        }

        return NextResponse.json(
          { error: 'PR number or branch name required' },
          { status: 400 }
        );
      }

      // Discard changes (delete branch)
      case 'discard': {
        const { branchName } = params;
        if (!branchName) {
          return NextResponse.json({ error: 'Branch name required' }, { status: 400 });
        }

        // Don't allow deleting main/master
        if (branchName === 'main' || branchName === 'master') {
          return NextResponse.json(
            { error: 'Cannot delete main/master branch' },
            { status: 400 }
          );
        }

        await octokit.rest.git.deleteRef({
          owner: repoOwner,
          repo: repoName,
          ref: `heads/${branchName}`,
        });

        return NextResponse.json({ success: true, deleted: branchName });
      }

      // Delete a branch
      case 'deleteBranch': {
        const { branchName } = params;
        if (!branchName) {
          return NextResponse.json({ error: 'Branch name required' }, { status: 400 });
        }

        await octokit.rest.git.deleteRef({
          owner: repoOwner,
          repo: repoName,
          ref: `heads/${branchName}`,
        });

        return NextResponse.json({ success: true, deleted: branchName });
      }

      default:
        return NextResponse.json(
          { error: `Invalid action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('GitHub POST error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
}
