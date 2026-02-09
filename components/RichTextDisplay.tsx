import React from 'react';
import DOMPurify from 'dompurify';

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

const RichTextDisplay: React.FC<RichTextDisplayProps> = ({ content, className }) => {
  if (!content) return null;

  // Detect whether the content contains HTML tags
  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  let html: string;
  if (isHtml) {
    html = content;
  } else {
    // Legacy plain text: convert newlines to HTML for identical visual output
    html =
      '<p>' +
      content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>') +
      '</p>';
  }

  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u',
      'h2', 'h3', 'ul', 'ol', 'li', 'blockquote',
    ],
    ALLOWED_ATTR: [],
  });

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
};

export default RichTextDisplay;
