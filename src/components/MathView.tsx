import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({
  latex,
  displayMode = false,
  className = '',
}) => {
  const renderedHtml = useMemo(() => {
    if (!latex) return '';
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        output: 'html',
      });
    } catch {
      return latex;
    }
  }, [latex, displayMode]);

  if (!latex) return null;

  return (
    <span
      className={`inline-block ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
