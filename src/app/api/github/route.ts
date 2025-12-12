import { NextRequest, NextResponse } from 'next/server';
import { GitHubClient } from '@/lib/github';
import { GitHubConfigError, resolveGitHubConfig } from './helpers';

// GET - List branches
export async function GET(request: NextRequest) {
  try {
    const { token, owner, repo } = resolveGitHubConfig(request);
    const github = new GitHubClient(token, owner, repo);
    const branches = await github.listBranches();

    return NextResponse.json({ branches });
  } catch (error: any) {
    if (error instanceof GitHubConfigError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create branch, create PR, merge, or delete
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received action:', body.action);
    const { action, ...params } = body;
    const { token, owner, repo } = resolveGitHubConfig(request, body);
    console.log('Config:', { hasToken: !!token, owner, repo });
    const github = new GitHubClient(token, owner, repo);

    switch (action) {
      case 'connect': {
        const context = await github.getAuthContext();
        return NextResponse.json({ ok: true, ...context });
      }

      case 'create': {
        const { branchName, fromBranch = 'main' } = params;
        if (!branchName) {
          return NextResponse.json(
            { error: 'Branch name required' },
            { status: 400 }
          );
        }

        // Sanitize branch name
        const safeBranchName = branchName
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');

        const branch = await github.createBranch(safeBranchName, fromBranch);
        return NextResponse.json({ branch });
      }

      case 'createPR': {
        const { title, body: prBody, head, base = 'main' } = params;
        if (!title || !head) {
          return NextResponse.json(
            { error: 'Title and head branch required' },
            { status: 400 }
          );
        }

        const pr = await github.createPullRequest(title, prBody || '', head, base);
        return NextResponse.json({ pr });
      }

      case 'merge': {
        const { prNumber, base = 'main', head } = params;
        if (!prNumber && !head) {
          return NextResponse.json(
            { error: 'PR number or head branch required' },
            { status: 400 }
          );
        }

        if (prNumber) {
          await github.mergePullRequest(prNumber);
          return NextResponse.json({ success: true });
        }

        const mergeResult = await github.mergeBranch(base, head);
        return NextResponse.json({ success: true, ...mergeResult });
      }

      case 'delete': {
        const { branchName } = params;
        if (!branchName) {
          return NextResponse.json(
            { error: 'Branch name required' },
            { status: 400 }
          );
        }

        await github.deleteBranch(branchName);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Full error:', error);
    if (error instanceof GitHubConfigError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
