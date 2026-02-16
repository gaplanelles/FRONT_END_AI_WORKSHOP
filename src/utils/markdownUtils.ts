/**
 * Converts markdown text to plain text suitable for text-to-speech
 * Removes markdown formatting symbols while preserving readable content
 */
export function markdownToPlainText(markdown: string): string {
    if (!markdown) return '';

    console.log('🔍 markdownToPlainText - Input length:', markdown.length);
    console.log('First 200 chars:', markdown.substring(0, 200));

    let text = markdown;

    // Remove table lines completely (they're hard to read aloud)
    // Match lines that start with | and contain table content
    const linesBefore = text.split('\n').length;
    text = text.split('\n')
        .filter(line => {
            const trimmed = line.trim();
            // Remove lines that look like table rows or separators
            if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
                console.log('  ❌ Removing table line:', trimmed.substring(0, 50));
                return false;
            }
            return true;
        })
        .join('\n');

    const linesAfter = text.split('\n').length;
    console.log(`📊 Removed ${linesBefore - linesAfter} table lines`);

    // Remove headers (###, ##, #) but keep the text
    text = text.replace(/^#{1,6}\s+(.+)$/gm, '$1');

    // Remove bold/italic (**, *, __, _)
    text = text.replace(/\*\*(.+?)\*\*/g, '$1'); // **bold**
    text = text.replace(/\*(.+?)\*/g, '$1');     // *italic*
    text = text.replace(/__(.+?)__/g, '$1');     // __bold__
    text = text.replace(/_(.+?)_/g, '$1');       // _italic_

    // Remove strikethrough
    text = text.replace(/~~(.+?)~~/g, '$1');

    // Remove inline code backticks
    text = text.replace(/`(.+?)`/g, '$1');

    // Remove code blocks
    text = text.replace(/```[\s\S]*?```/g, '');

    // Remove links but keep the text [text](url) -> text
    text = text.replace(/\[(.+?)\]\(.+?\)/g, '$1');

    // Remove images
    text = text.replace(/!\[.*?\]\(.+?\)/g, '');

    // Remove blockquotes
    text = text.replace(/^>\s+/gm, '');

    // Remove horizontal rules
    text = text.replace(/^[\-\*_]{3,}$/gm, '');

    // Remove list markers but keep the text
    text = text.replace(/^\s*[\*\-\+]\s+/gm, ''); // unordered lists
    text = text.replace(/^\s*\d+\.\s+/gm, '');    // ordered lists

    // Clean up multiple newlines
    text = text.replace(/\n{3,}/g, '\n\n');

    // Trim whitespace from each line
    text = text.split('\n').map(line => line.trim()).join('\n');

    // Remove empty lines
    text = text.replace(/^\s*\n/gm, '');

    const result = text.trim();
    console.log('✅ Final output length:', result.length);
    console.log('First 200 chars of output:', result.substring(0, 200));

    return result;
}
