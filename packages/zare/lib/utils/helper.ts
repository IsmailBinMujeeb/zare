export function escapeHTML(str: string): string {
  return str.replace(/[&<>"']/g, char => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#039;';
      default:
        return char;
    }
  });
}

export function sanitizeOptions(
  options: Record<string, any>,
): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const key in options) {
    if (typeof options[key] === 'string') {
      sanitized[key] = escapeHTML(options[key]);
    } else if (typeof options[key] === 'object' && options[key] !== null) {
      sanitized[key] = Array.isArray(options[key])
        ? options[key].map(item =>
            typeof item === 'string' ? escapeHTML(item) : item,
          )
        : sanitizeOptions(options[key]);
    } else {
      sanitized[key] = options[key];
    }
  }

  return sanitized;
}
