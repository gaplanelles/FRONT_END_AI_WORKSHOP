/**
 * Converts markdown text to plain text suitable for text-to-speech
 * Removes markdown formatting symbols while preserving readable content
 * Converts tables to narrative format
 */
export function markdownToPlainText(markdown: string): string {
    if (!markdown) return '';

    let text = markdown;

    // Convert markdown tables to readable text
    text = convertTablesToText(text);

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

    return text.trim();
}

/**
 * Converts markdown tables to readable narrative text
 * Example: 
 * Input: | Aspecto | SPW | POLONIA |
 *        |---------|-----|---------|
 *        | Quién   | X   | Y       |
 * Output: "Quién: SPW es X, POLONIA es Y."
 */
function convertTablesToText(markdown: string): string {
    // Match markdown tables (including multi-line)
    const tableRegex = /^\|.+\|[\r\n]+\|[\s\-:]+\|[\r\n]+((?:\|.+\|[\r\n]*)+)/gm;

    return markdown.replace(tableRegex, (match) => {
        const lines = match.trim().split('\n').map(line => line.trim());

        if (lines.length < 3) return ''; // Need at least header, separator, and one row

        // Parse header row
        const headers = lines[0]
            .split('|')
            .map(cell => cell.trim())
            .filter(cell => cell.length > 0);

        // Skip separator line (lines[1])

        // Parse data rows
        const dataRows = lines.slice(2).map(line =>
            line.split('|')
                .map(cell => cell.trim())
                .filter(cell => cell.length > 0)
        );

        // Convert to readable text
        let readableText = '\n';

        // For each data row
        dataRows.forEach((row) => {
            if (row.length === 0) return;

            // First column is usually the "label" or "aspect"
            const label = row[0];

            if (row.length === 2) {
                // Simple two-column table: Label | Value
                readableText += `${label}: ${row[1]}. `;
            } else if (row.length > 2) {
                // Multi-column table: create comparisons
                readableText += `${label}: `;

                // Add each column with its header
                const comparisons = [];
                for (let i = 1; i < row.length && i < headers.length; i++) {
                    if (row[i]) {
                        comparisons.push(`${headers[i]} es ${row[i]}`);
                    }
                }

                readableText += comparisons.join(', ') + '. ';
            }
        });

        return readableText + '\n';
    });
}
