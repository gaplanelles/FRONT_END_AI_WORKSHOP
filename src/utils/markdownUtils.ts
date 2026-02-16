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
 */
function convertTablesToText(markdown: string): string {
    console.log('🔍 Converting tables - input length:', markdown.length);

    // More flexible regex that handles tables with varying whitespace
    // Matches: header row | separator row | data rows
    const tableRegex = /\|.+\|\s*\n\s*\|[\s\-:]+\|\s*\n((?:\s*\|.+\|\s*\n?)+)/g;

    let matchCount = 0;
    const result = markdown.replace(tableRegex, (match) => {
        matchCount++;
        console.log(`📊 Found table #${matchCount}:`, match.substring(0, 100) + '...');

        const lines = match.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        console.log('  Table has', lines.length, 'lines');

        if (lines.length < 3) {
            console.log('  ⚠️ Table too short, skipping');
            return '';
        }

        // Parse header row
        const headers = lines[0]
            .split('|')
            .map(cell => cell.trim())
            .filter(cell => cell.length > 0);

        console.log('  Headers:', headers);

        // Skip separator line (lines[1])

        // Parse data rows (skip first 2 lines: header + separator)
        const dataRows = lines.slice(2).map(line =>
            line.split('|')
                .map(cell => cell.trim())
                .filter(cell => cell.length > 0)
        ).filter(row => row.length > 0);

        console.log('  Data rows:', dataRows.length);

        // Convert to readable text
        let readableText = '\n';

        dataRows.forEach((row, idx) => {
            if (row.length === 0) return;

            console.log(`  Processing row ${idx}:`, row);

            // First column is the label/aspect
            const label = row[0];

            if (row.length === 2) {
                // Two columns: Label | Value
                readableText += `${label}: ${row[1]}. `;
            } else if (row.length > 2) {
                // Multi-column: Label | Col1 | Col2 | ...
                readableText += `${label}: `;

                const comparisons = [];
                for (let i = 1; i < row.length && i < headers.length; i++) {
                    if (row[i] && row[i].length > 0) {
                        comparisons.push(`${headers[i]} - ${row[i]}`);
                    }
                }

                readableText += comparisons.join('; ') + '. ';
            }
        });

        console.log('  ✅ Converted to:', readableText.substring(0, 100) + '...');
        return readableText + '\n';
    });

    console.log(`✅ Total tables converted: ${matchCount}`);
    return result;
}
