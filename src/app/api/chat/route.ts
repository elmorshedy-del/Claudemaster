import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { parseCodeBlocks, generateBranchName } from '@/lib/codeParser';

const PRICE_PER_MILLION_INPUT: Record<string, number> = {
  'haiku-4.5': 1,
  'sonnet-4.5': 3,
  'sonnet-4': 3,
  'opus-4.5': 15,
  'opus-4.1': 15,
};

const PRICE_PER_MILLION_OUTPUT: Record<string, number> = {
  'haiku-4.5': 5,
  'sonnet-4.5': 15,
  'sonnet-4': 15,
  'opus-4.5': 75,
  'opus-4.1': 75,
};

const MODEL_MAP: Record<string, string> = {
  'haiku-4.5': 'claude-haiku-4-5-20251001',
  'sonnet-4.5': 'claude-sonnet-4-5-20250929',
  'sonnet-4': 'claude-sonnet-4-20250514',
  'opus-4.5': 'claude-opus-4-5-20251122',
  'opus-4.1': 'claude-opus-4-1-20250805',
};

// Fetch repository files for context
async function fetchRepoContext(token: string, owner: string, repo: string): Promise<string> {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Claude-Coder'
  };

  try {
    // Get repository tree
    let treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`,
      { headers }
    );
    
    if (!treeResponse.ok) {
      treeResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`,
        { headers }
      );
      if (!treeResponse.ok) return '';
    }
    
    const treeData = await treeResponse.json();
    
    // Filter for code files
    const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.md'];
    const excludePaths = ['node_modules', 'dist', '.next', '.git', 'package-lock.json'];
    
    const codeFiles = treeData.tree?.filter((item: any) => {
      if (item.type !== 'blob') return false;
      if (excludePaths.some(p => item.path.includes(p))) return false;
      return codeExtensions.some(ext => item.path.endsWith(ext));
    }) || [];

    // Get priority files (src, components, app, config)
    const priorityFiles = codeFiles
      .filter((f: any) => 
        f.path.includes('src/') || 
        f.path.includes('app/') || 
        f.path.includes('components/') ||
        f.path === 'package.json' ||
        f.path.endsWith('.config.ts') ||
        f.path.endsWith('.config.js')
      )
      .slice(0, 20);

    let context = `\n## Repository: ${owner}/${repo}\n\n### File Structure:\n`;
    context += codeFiles.map((f: any) => `- ${f.path}`).join('\n');
    context += '\n\n### File Contents:\n';

    // Fetch content of priority files
    for (const file of priorityFiles) {
      try {
        const contentResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`,
          { headers }
        );
        
        if (contentResponse.ok) {
          const contentData = await contentResponse.json();
          if (contentData.content) {
            const decoded = Buffer.from(contentData.content, 'base64').toString('utf-8');
            const truncated = decoded.length > 3000 ? decoded.slice(0, 3000) + '\n...(truncated)' : decoded;
            const ext = file.path.split('.').pop() || '';
            context += `\n#### ${file.path}\n\`\`\`${ext}\n${truncated}\n\`\`\`\n`;
          }
        }
      } catch (e) {
        // Skip files that can't be fetched
      }
    }

    return context;
  } catch (error) {
    console.error('Error fetching repo context:', error);
    return '';
  }
}

// Push changes to GitHub
async function pushChangesToGitHub(
  files: Array<{ path: string; content: string }>,
  deployMode: 'safe' | 'direct',
  userMessage: string,
  options: { token?: string; owner?: string; repo?: string; railwayProjectId?: string } = {}
): Promise<{ success: boolean; branch?: any; error?: string }> {
  const githubToken = options.token || process.env.GITHUB_TOKEN;
  const owner = options.owner || process.env.GITHUB_REPO_OWNER;
  const repo = options.repo || process.env.GITHUB_REPO_NAME;
  const railwayProjectId = options.railwayProjectId || process.env.RAILWAY_PROJECT_ID;

  if (!githubToken || !owner || !repo) {
    return { success: false, error: 'GitHub not configured' };
  }

  try {
    const baseUrl = process.env.VERCEL_URL || process.env.RAILWAY_PUBLIC_DOMAIN || 'localhost:3000';
    const apiBase = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;

    if (deployMode === 'safe') {
      // Create a new branch
      const branchName = generateBranchName(userMessage);
      
      const createBranchRes = await fetch(`${apiBase}/api/github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createBranch',
          token: githubToken,
          owner,
          repo,
          branchName,
          fromBranch: 'main'
        })
      });

      if (!createBranchRes.ok) {
        const err = await createBranchRes.json();
        return { success: false, error: err.error || 'Failed to create branch' };
      }

      // Commit files to the new branch
      const commitRes = await fetch(`${apiBase}/api/github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'commit',
          token: githubToken,
          owner,
          repo,
          branch: branchName,
          files,
          message: `Claude Coder: ${userMessage.slice(0, 50)}...`
        })
      });

      if (!commitRes.ok) {
        const err = await commitRes.json();
        return { success: false, error: err.error || 'Failed to commit' };
      }

      const commitData = await commitRes.json();

      // Generate preview URL (Railway format)
      let previewUrl: string | undefined;
      if (railwayProjectId) {
        // Railway preview deployments use branch name in URL
        const sanitizedBranch = branchName.replace(/[^a-z0-9-]/g, '-');
        previewUrl = `https://${repo}-${sanitizedBranch}.up.railway.app`;
      }

      return {
        success: true,
        branch: {
          name: branchName,
          sha: commitData.commit?.sha,
          filesChanged: files.length,
          previewUrl,
          createdAt: new Date()
        }
      };
    } else {
      // Direct mode - commit straight to main
      const commitRes = await fetch(`${apiBase}/api/github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'commit',
          token: githubToken,
          owner,
          repo,
          branch: 'main',
          files,
          message: `Claude Coder: ${userMessage.slice(0, 50)}...`
        })
      });

      if (!commitRes.ok) {
        const err = await commitRes.json();
        return { success: false, error: err.error || 'Failed to commit to main' };
      }

      const commitData = await commitRes.json();

      return {
        success: true,
        branch: {
          name: 'main',
          sha: commitData.commit?.sha,
          filesChanged: files.length,
          createdAt: new Date(),
          isDirect: true
        }
      };
    }
  } catch (error: any) {
    console.error('Push error:', error);
    return { success: false, error: error.message };
  }
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();
  
  try {
    const body = await req.json();
    const {
      messages,
      settings = {},
      files,
      githubToken: providedGithubToken,
      repoOwner: providedRepoOwner,
      repoName: providedRepoName,
    } = body;
    
    // ============ Validate messages (fixes 400 error) ============
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages provided' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const githubToken = providedGithubToken || process.env.GITHUB_TOKEN;
    const repoOwner = providedRepoOwner || process.env.GITHUB_REPO_OWNER;
    const repoName = providedRepoName || process.env.GITHUB_REPO_NAME;
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const anthropic = new Anthropic({ apiKey });
    
    // ============ Filter empty messages ============
    const anthropicMessages = messages
      .filter((msg: any) => msg.content && msg.content.trim() !== '')
      .map((msg: any) => {
        const content: any[] = [];
        
        if (msg.content && msg.content.trim()) {
          content.push({ type: 'text', text: msg.content.trim() });
        }
        
        // Add files if present
        if (msg.files && msg.files.length > 0) {
          msg.files.forEach((file: any) => {
            if (file.type?.startsWith('image/') && file.base64) {
              content.push({
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: file.type,
                  data: file.base64.includes(',') ? file.base64.split(',')[1] : file.base64
                }
              });
            } else if (file.type === 'application/pdf' && file.base64) {
              content.push({
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: file.base64.includes(',') ? file.base64.split(',')[1] : file.base64
                }
              });
            }
          });
        }
        
        if (content.length === 0) {
          content.push({ type: 'text', text: '(empty)' });
        }
        
        return { role: msg.role, content };
      });

    if (anthropicMessages.length === 0) {
      return new Response(JSON.stringify({ error: 'All messages were empty' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ============ Build system prompt with repo context ============
    let systemPrompt = `You are Claude Coder, an expert AI coding assistant with direct access to the user's GitHub repository.

## Your Capabilities:
- Read and understand the entire codebase
- Write, edit, and refactor code
- Create new files and modify existing ones
- Explain technical concepts
- Suggest improvements and best practices

## Code Output Format:
When you create or modify code, ALWAYS use this format so changes can be automatically applied:

\`\`\`typescript:path/to/file.ts
// Your code here
\`\`\`

The file path MUST be included after the language, separated by a colon.

## Current Mode: ${settings.deployMode === 'safe' ? 'SAFE MODE (changes go to a new branch for review)' : 'DIRECT MODE (changes push directly to main)'}

## Guidelines:
1. Always show complete file contents when creating or updating files
2. Use the exact file path format shown above
3. Explain what changes you're making and why
4. Be concise but thorough
5. Follow existing code patterns and conventions in the repository`;

    // Fetch GitHub repo context if configured
    if (githubToken && repoOwner && repoName) {
      console.log(`Fetching repo context: ${repoOwner}/${repoName}`);
      const repoContext = await fetchRepoContext(githubToken, repoOwner, repoName);
      if (repoContext) {
        systemPrompt += `\n\n## Connected Repository:\n${repoContext}`;
      }
    } else {
      systemPrompt += `\n\n## Note: No GitHub repository connected. To enable automatic code pushing, set GITHUB_TOKEN, GITHUB_REPO_OWNER, and GITHUB_REPO_NAME environment variables.`;
    }

    const modelKey = settings.model || 'sonnet-4.5';
    const model = MODEL_MAP[modelKey] || MODEL_MAP['sonnet-4.5'];
    
    // Get the user's last message for branch naming
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content || '';
    
    // ============ Create streaming response ============
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const streamParams: any = {
            model,
            max_tokens: 4096,
            system: systemPrompt,
            messages: anthropicMessages,
            stream: true,
          };

          if (settings.enableExtendedThinking) {
            streamParams.thinking = {
              type: 'enabled',
              budget_tokens: 10000
            };
          }

          const messageStream = await anthropic.messages.create(streamParams);

          let fullText = '';
          let usage: any = null;

          for await (const event of messageStream as any) {
            if (event.type === 'content_block_delta') {
              if (event.delta.type === 'text_delta') {
                fullText += event.delta.text;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'content', delta: event.delta.text })}\n\n`)
                );
              }
            } else if (event.type === 'message_delta') {
              usage = event.usage;
            }
          }

          // ============ Parse code blocks and push to GitHub ============
          if (githubToken && repoOwner && repoName) {
            const parsed = parseCodeBlocks(fullText);
            
            if (parsed.fileChanges.length > 0) {
              console.log(`Found ${parsed.fileChanges.length} file changes to push`);

              const pushResult = await pushChangesToGitHub(
                parsed.fileChanges.map(f => ({ path: f.path, content: f.content })),
                settings.deployMode || 'safe',
                lastUserMessage,
                {
                  token: githubToken,
                  owner: repoOwner,
                  repo: repoName,
                  railwayProjectId: process.env.RAILWAY_PROJECT_ID
                }
              );
              
              if (pushResult.success && pushResult.branch) {
                // Send branch info to frontend
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ 
                    type: 'branch', 
                    branch: pushResult.branch 
                  })}\n\n`)
                );
                
                // Also send a message about what was pushed
                const pushMessage = settings.deployMode === 'safe'
                  ? `\n\n---\n✅ **Changes pushed to branch \`${pushResult.branch.name}\`** (${pushResult.branch.filesChanged} files)${pushResult.branch.previewUrl ? `\n🔗 Preview: ${pushResult.branch.previewUrl}` : ''}`
                  : `\n\n---\n✅ **Changes pushed directly to \`main\`** (${pushResult.branch.filesChanged} files)`;
                
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'content', delta: pushMessage })}\n\n`)
                );
              } else if (pushResult.error) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ 
                    type: 'content', 
                    delta: `\n\n---\n⚠️ **Could not push changes:** ${pushResult.error}` 
                  })}\n\n`)
                );
              }
            }
          }

          // ============ Send cost/usage data ============
          if (usage) {
            const inputCost = (usage.input_tokens / 1_000_000) * (PRICE_PER_MILLION_INPUT[modelKey] || 3);
            const outputCost = (usage.output_tokens / 1_000_000) * (PRICE_PER_MILLION_OUTPUT[modelKey] || 15);
            const totalCost = inputCost + outputCost;
            
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: 'cost',
                cost: totalCost,
                tokensUsed: {
                  input: usage.input_tokens,
                  output: usage.output_tokens,
                  cacheRead: usage.cache_read_input_tokens || 0,
                  cacheWrite: usage.cache_creation_input_tokens || 0
                }
              })}\n\n`)
            );
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error: any) {
          console.error('Stream error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`)
          );
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error: any) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
