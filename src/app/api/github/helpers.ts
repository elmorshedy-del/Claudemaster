import { NextRequest } from 'next/server';

export class GitHubConfigError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

interface GitHubConfigParams {
  token?: string;
  owner?: string;
  repo?: string;
}

const resolveToken = (request: NextRequest, body?: GitHubConfigParams): string | undefined => {
  const headerToken = request.headers.get('x-github-token') || request.headers.get('github-token');
  const authHeader = request.headers.get('authorization');

  if (authHeader?.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }

  if (authHeader?.toLowerCase().startsWith('token ')) {
    return authHeader.slice(6).trim();
  }

  return body?.token || headerToken || process.env.GITHUB_TOKEN;
};

const resolveOwner = (request: NextRequest, body?: GitHubConfigParams): string | undefined => {
  const owner = request.nextUrl.searchParams.get('owner');
  return body?.owner || owner || process.env.GITHUB_OWNER;
};

const resolveRepo = (request: NextRequest, body?: GitHubConfigParams): string | undefined => {
  const repo = request.nextUrl.searchParams.get('repo');
  return body?.repo || repo || process.env.GITHUB_REPO;
};

export const resolveGitHubConfig = (
  request: NextRequest,
  body?: GitHubConfigParams
): Required<GitHubConfigParams> => {
  const token = resolveToken(request, body);
  const owner = resolveOwner(request, body);
  const repo = resolveRepo(request, body);

  if (!token) {
    throw new GitHubConfigError('Missing GitHub token. Provide it via Authorization header, x-github-token, or env GITHUB_TOKEN.');
  }

  if (!owner || !repo) {
    throw new GitHubConfigError('Missing GitHub repository information. Provide owner and repo in the request or env variables.');
  }

  return { token, owner, repo } as Required<GitHubConfigParams>;
};
