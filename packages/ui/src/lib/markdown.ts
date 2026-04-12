// Markdown to HTML converter for notes and descriptions
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let html = markdown;

  // Extract code blocks before escaping HTML
  const codeBlocks: string[] = [];
  html = html.replace(/```([^\n`]*)\n?([\s\S]*?)```/g, (_match, language, code) => {
    const lang = (language || '').trim() || 'text';
    const placeholder = `\n__CODE_BLOCK_${codeBlocks.length}__\n`;

    const cleanCode = code.replace(/\n$/, '');
    const escapedCode = cleanCode
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const codeBlock = `<div style="margin: 1rem 0;"><div style="background: #1a1a1a; color: #888; padding: 0.25rem 0.5rem; border-radius: 6px 6px 0 0; font-size: 0.75rem; font-family: 'Consolas', 'Monaco', monospace;">${lang}</div><pre style="margin: 0; border-radius: 0 0 6px 6px;"><code>${escapedCode}</code></pre></div>`;
    codeBlocks.push(codeBlock);
    return placeholder;
  });

  // Escape HTML tags in remaining text
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Convert **Bold subsections** with colon
  html = html.replace(/\*\*([^*]+)\*\*:/g, '<strong style="color: var(--primary); display: block; margin-top: 1rem; margin-bottom: 0.5rem;">$1:</strong>');

  // Convert **Bold** (remaining)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Convert *Italic*
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Convert `inline code`
  html = html.replace(/`([^`]+)`/g, '<code style="background: #2d2d2d; color: #f8f8f2; padding: 0.125rem 0.35rem; border-radius: 3px; font-family: \'Consolas\', \'Monaco\', monospace; font-size: 0.9em;">$1</code>');

  // Convert links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: var(--primary); text-decoration: underline;">$1</a>');

  // Convert bullet lists and paragraphs
  const lines = html.split('\n');
  let inList = false;
  const result: string[] = [];

  for (const line of lines) {
    if (line.trim() === '' || line.trim().match(/^__CODE_BLOCK_\d+__$/)) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      if (line.trim().startsWith('__CODE_BLOCK_')) {
        result.push(line.trim());
      } else if (line.trim() === '') {
        if (!inList) {
          result.push('');
        }
      }
      continue;
    }

    if (line.trim().startsWith('- ')) {
      if (!inList) {
        result.push('<ul style="margin: 0.5rem 0; padding-left: 1.5rem;">');
        inList = true;
      }
      result.push('<li>' + line.trim().substring(2) + '</li>');
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      if (line.trim()) {
        result.push('<p style="margin: 0.5rem 0;">' + line + '</p>');
      }
    }
  }

  if (inList) {
    result.push('</ul>');
  }

  html = result.join('\n');

  // Replace code block placeholders
  codeBlocks.forEach((block, index) => {
    html = html.replace(`__CODE_BLOCK_${index}__`, block);
  });

  return html;
}
