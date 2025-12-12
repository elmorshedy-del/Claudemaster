// Parse code blocks from Claude's response to extract file changes

export interface FileChange {
  path: string;
  content: string;
  action: 'create' | 'update' | 'delete';
}

export interface ParsedResponse {
  text: string;
  fileChanges: FileChange[];
}

// Patterns to detect file paths in code blocks
const FILE_PATH_PATTERNS = [
  // ```typescript:src/app/page.tsx or ```tsx:src/components/Button.tsx
  /^```(?:typescript|tsx|ts|javascript|jsx|js|css|json|html|md|python|py|go|rust|java|cpp|c):([\w\-\/\.]+)/,
  // File: src/app/page.tsx or // File: src/app/page.tsx
  /^(?:\/\/\s*)?[Ff]ile:\s*([\w\-\/\.]+)/,
  // # src/app/page.tsx (markdown header style)
  /^#\s*([\w\-\/\.]+\.\w+)/,
  // Path: src/app/page.tsx
  /^[Pp]ath:\s*([\w\-\/\.]+)/,
];

// Common code file extensions
const CODE_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.css', '.scss', '.less',
  '.json', '.yaml', '.yml',
  '.html', '.htm', '.xml',
  '.md', '.mdx',
  '.py', '.go', '.rs', '.java', '.cpp', '.c', '.h',
  '.sh', '.bash', '.zsh',
  '.sql', '.graphql',
  '.env', '.env.local', '.env.example',
  '.gitignore', '.dockerignore',
  'Dockerfile', 'docker-compose.yml',
  'package.json', 'tsconfig.json', 'next.config.js', 'tailwind.config.js'
];

export function parseCodeBlocks(response: string): ParsedResponse {
  const fileChanges: FileChange[] = [];
  const lines = response.split('\n');
  
  let inCodeBlock = false;
  let currentFile: string | null = null;
  let currentContent: string[] = [];
  let codeBlockLang = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for code block start
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        // Starting a code block
        inCodeBlock = true;
        currentContent = [];
        
        // Try to extract file path from the code block header
        for (const pattern of FILE_PATH_PATTERNS) {
          const match = line.match(pattern);
          if (match) {
            currentFile = match[1];
            break;
          }
        }
        
        // Extract language hint
        const langMatch = line.match(/^```(\w+)/);
        codeBlockLang = langMatch ? langMatch[1] : '';
        
        // If no file path in header, check the line before
        if (!currentFile && i > 0) {
          const prevLine = lines[i - 1].trim();
          for (const pattern of FILE_PATH_PATTERNS) {
            const match = prevLine.match(pattern);
            if (match) {
              currentFile = match[1];
              break;
            }
          }
          
          // Also check for patterns like "Create `src/file.ts`:" or "Update src/file.ts:"
          const createMatch = prevLine.match(/(?:create|update|edit|modify|add|change)\s+[`']?([\w\-\/\.]+)[`']?/i);
          if (createMatch) {
            currentFile = createMatch[1];
          }
        }
      } else {
        // Ending a code block
        inCodeBlock = false;
        
        if (currentFile && currentContent.length > 0) {
          // Validate it looks like a real file path
          const hasExtension = CODE_EXTENSIONS.some(ext => 
            currentFile!.endsWith(ext) || currentFile!.includes(ext.slice(1) + '/')
          ) || /\.\w{1,5}$/.test(currentFile);
          
          if (hasExtension) {
            // Clean up the path
            let cleanPath = currentFile
              .replace(/^[`'"]|[`'"]$/g, '') // Remove quotes
              .replace(/^\.\//, '') // Remove leading ./
              .replace(/^\/*/, ''); // Remove leading slashes
            
            fileChanges.push({
              path: cleanPath,
              content: currentContent.join('\n'),
              action: 'update' // Default to update, could be smarter about create vs update
            });
          }
        }
        
        currentFile = null;
        currentContent = [];
      }
    } else if (inCodeBlock) {
      currentContent.push(line);
    }
  }
  
  // Deduplicate - if same file appears multiple times, keep the last one
  const uniqueChanges = new Map<string, FileChange>();
  for (const change of fileChanges) {
    uniqueChanges.set(change.path, change);
  }
  
  return {
    text: response,
    fileChanges: Array.from(uniqueChanges.values())
  };
}

// Detect if a message is asking for code changes
export function isCodeChangeRequest(message: string): boolean {
  const codeChangePatterns = [
    /\b(create|make|write|add|update|edit|modify|change|fix|refactor|implement|build)\b.*\b(file|component|function|class|module|page|route|api|code)\b/i,
    /\b(can you|please|could you)\b.*\b(create|make|write|add|update|edit|modify|change|fix)\b/i,
    /\badd\s+(a\s+)?(new\s+)?(file|component|function|feature)/i,
    /\bupdate\s+(the\s+)?(code|file|component)/i,
    /\bchange\s+(the\s+)?\w+\s+(to|in)/i,
    /\bfix\s+(the\s+)?(bug|error|issue|problem)/i,
  ];
  
  return codeChangePatterns.some(pattern => pattern.test(message));
}

// Generate a branch name from the conversation
export function generateBranchName(message: string): string {
  // Extract key words from the message
  const words = message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !['the', 'and', 'for', 'can', 'you', 'please', 'could', 'would'].includes(w))
    .slice(0, 4);
  
  const timestamp = Date.now().toString(36);
  const nameBase = words.length > 0 ? words.join('-') : 'claude-changes';
  
  return `claude/${nameBase}-${timestamp}`.slice(0, 50);
}
