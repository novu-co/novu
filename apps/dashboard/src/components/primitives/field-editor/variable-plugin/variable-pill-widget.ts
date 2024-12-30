import { WidgetType } from '@uiw/react-codemirror';
import { DARK_MODE_CLASS, VARIABLE_PILL_CLASS, MODIFIERS_CLASS } from './constants';

export class VariablePillWidget extends WidgetType {
  constructor(
    private variableName: string,
    private fullVariableName: string,
    private start: number,
    private end: number,
    private hasModifiers: boolean,
    private onSelect?: (value: string, from: number, to: number) => void
  ) {
    super();
  }

  toDOM() {
    const span = document.createElement('span');
    const isDarkMode = document.documentElement.classList.contains(DARK_MODE_CLASS);
    const pillClass = `${VARIABLE_PILL_CLASS} ${isDarkMode ? 'cm-dark' : ''} ${
      this.hasModifiers ? MODIFIERS_CLASS : ''
    }`;

    span.className = pillClass;
    span.setAttribute('data-variable', this.fullVariableName);
    span.setAttribute('data-start', this.start.toString());
    span.setAttribute('data-end', this.end.toString());
    span.setAttribute('data-display', this.variableName);
    span.textContent = this.variableName;

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setTimeout(() => {
        this.onSelect?.(this.fullVariableName, this.start, this.end);
      }, 0);
    };

    span.addEventListener('mousedown', handleClick);
    (span as any)._variableClickHandler = handleClick;

    return span;
  }

  eq(other: VariablePillWidget) {
    return (
      other.variableName === this.variableName &&
      other.fullVariableName === this.fullVariableName &&
      other.start === this.start &&
      other.end === this.end &&
      other.hasModifiers === this.hasModifiers
    );
  }

  destroy(dom: HTMLElement) {
    if ((dom as any)._variableClickHandler) {
      dom.removeEventListener('mousedown', (dom as any)._variableClickHandler);
      delete (dom as any)._variableClickHandler;
    }
  }

  ignoreEvent() {
    return false;
  }
}
