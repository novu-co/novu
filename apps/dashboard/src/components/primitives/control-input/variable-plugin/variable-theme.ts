import { EditorView } from '@uiw/react-codemirror';
import { VARIABLE_PILL_CLASS } from './';

export const variablePillTheme = EditorView.baseTheme({
  [`.${VARIABLE_PILL_CLASS}`]: {
    backgroundColor: 'hsl(var(--bg-weak))',
    color: 'hsl(var(--text-sub))',
    border: '1px solid hsl(var(--stroke-soft))',
    borderRadius: '10px',
    padding: '2px 6px 2px 6px',
    fontFamily: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    height: '17px',
    lineHeight: '17px',
    fontSize: '12px',
    cursor: 'pointer',
    position: 'relative',
    marginRight: '0px',
    top: '2px',
  },
  '.cm-variable-pill::before': {
    content: '""',
    left: '4px',
    width: '12px',
    minWidth: '12px',
    height: '12px',
    marginRight: '3px',
    backgroundImage: `url("/images/code.svg")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'contain',
  },
  '.cm-variable-pill.has-filters::after': {
    content: '""',
    width: '4px',
    height: '4px',
    backgroundColor: 'hsl(var(--feature-base))',
    borderRadius: '50%',
    marginLeft: '3px',
  },
  '.cm-variable-pill .cm-bracket': {
    display: 'none',
  },
  '.cm-content': {
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  '.cm-line': {
    lineHeight: '21px !important',
    paddingLeft: 0,
  },
});
