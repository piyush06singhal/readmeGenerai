import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';

interface EditorPaneProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

const extensions = [markdown(), EditorView.lineWrapping];

export default function EditorPane({ value, onChange, readOnly }: EditorPaneProps) {
  return (
    <div className="h-full overflow-hidden">
      <CodeMirror
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        extensions={extensions}
        className="h-full"
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
        }}
      />
    </div>
  );
}
