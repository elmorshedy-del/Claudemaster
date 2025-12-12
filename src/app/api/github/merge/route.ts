import { NextRequest, NextResponse } from 'next/server';
import { GitHubClient } from '@/lib/github';
import { GitHubConfigError, resolveGitHubConfig } from '../helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { branch, base = 'main' } = body;

    if (!branch) {
      return NextResponse.json({ error: 'Branch name required' }, { status: 400 });
    }

    const { token, owner, repo } = resolveGitHubConfig(request, body);
    const github = new GitHubClient(token, owner, repo);
    const result = await github.mergeBranch(base, branch);

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    if (error instanceof GitHubConfigError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
