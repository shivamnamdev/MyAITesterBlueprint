/**
 * Web Scraper for Online Job Postings
 * Fetches page content, strips HTML noise, and extracts the core job description.
 */

export async function fetchJobPageContent(url) {
  try {
    if (!url || !url.startsWith('http')) {
      throw new Error('Please provide a valid HTTP or HTTPS URL.');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9'
    };

    const response = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: HTTP ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const extracted = sanitizeAndExtractJobText(html, url);

    return {
      success: true,
      url,
      pageTitle: extracted.title,
      rawText: extracted.text
    };
  } catch (err) {
    return {
      success: false,
      url,
      error: err.name === 'AbortError' ? 'Page fetch timed out after 8 seconds.' : err.message
    };
  }
}

function sanitizeAndExtractJobText(html, url) {
  // Extract <title>
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? decodeEntities(titleMatch[1].trim()) : '';

  // Remove scripts, styles, svg, and comments
  let cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '');

  // Convert headings and list items to lines
  cleaned = cleaned
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<\/li>/gi, '')
    .replace(/<[^>]+>/g, ' '); // remove all other html tags

  // Decode entities & collapse whitespace
  cleaned = decodeEntities(cleaned)
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();

  // If text is very long, extract the relevant job body
  return {
    title,
    text: cleaned.slice(0, 8000)
  };
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

