import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ProjectStructureNode } from '../types';

interface FileTreeViewProps {
  nodes: ProjectStructureNode[];
  /** Called with a file's path when the user clicks a file to preview it. */
  onFileSelect?: (path: string) => void;
}

interface FileNodeProps {
  node: ProjectStructureNode;
  depth: number;
  onFileSelect?: (path: string) => void;
}

const ease = [0.22, 1, 0.36, 1] as const;

function getFileIcon(name: string, isDirectory: boolean): string {
  if (isDirectory) return '📁';
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  switch (ext) {
    case 'ts':
    case 'tsx':
      return '💙';
    case 'js':
    case 'jsx':
    case 'mjs':
      return '🟨';
    case 'json':
      return '⚙️';
    case 'md':
      return '📝';
    case 'css':
    case 'scss':
    case 'less':
      return '🎨';
    case 'html':
      return '🌐';
    case 'yml':
    case 'yaml':
      return '🔧';
    case 'toml':
      return '⚛️';
    case 'py':
      return '🐍';
    case 'rs':
      return '🦀';
    case 'go':
      return '🐹';
    default:
      return '📄';
  }
}

function FileNode({ node, depth, onFileSelect }: FileNodeProps) {
  const [expanded, setExpanded] = useState(depth < 1);
  const isDirectory = node.type === 'directory';
  const hasChildren = isDirectory && node.children && node.children.length > 0;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease }}
        className="group flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors duration-150"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 flex-1 text-left min-w-0"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <svg
              className={`w-3 h-3 text-text-tertiary transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="text-sm">{getFileIcon(node.name, true)}</span>
            <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors truncate">
              {node.name}
            </span>
            <span className="text-[10px] text-text-muted shrink-0">
              {node.children?.length ?? 0}
            </span>
          </button>
        ) : (
          <button
            onClick={() => onFileSelect?.(node.path)}
            disabled={!onFileSelect}
            aria-label={`Preview ${node.path}`}
            title="Click to preview"
            className="group/file flex items-center gap-1.5 flex-1 min-w-0 text-left cursor-pointer disabled:cursor-default"
          >
            <svg className="w-3 h-3 text-text-muted shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5h3l2 2h5a2 2 0 012 2v9a2 2 0 01-2 2H8a2 2 0 01-2-2V7a2 2 0 012-2z" />
            </svg>
            <span className="text-sm">{getFileIcon(node.name, false)}</span>
            <span className="text-sm text-text-muted group-hover:text-text-secondary transition-colors truncate">
              {node.name}
            </span>
            <svg
              className="w-3.5 h-3.5 text-accent-indigo opacity-0 group-hover/file:opacity-100 transition-opacity ml-auto shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        )}
      </motion.div>

      {hasChildren && expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
          className="border-l border-slate-200 ml-[18px]"
        >
          {node.children?.map((child) => (
            <FileNode key={child.path} node={child} depth={depth + 1} onFileSelect={onFileSelect} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default function FileTreeView({ nodes, onFileSelect }: FileTreeViewProps) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 backdrop-blur-xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          Project Structure
        </h3>
        <span className="text-xs text-text-tertiary">
          {nodes.length} top-level {nodes.length === 1 ? 'item' : 'items'}
        </span>
      </div>
      <div className="max-h-[400px] overflow-y-auto pr-2 space-y-0.5">
        {nodes.map((node) => (
          <FileNode key={node.path} node={node} depth={0} onFileSelect={onFileSelect} />
        ))}
        {nodes.length === 0 && (
          <p className="text-sm text-text-tertiary py-8 text-center">
            No files found to display.
          </p>
        )}
      </div>
    </div>
  );
}