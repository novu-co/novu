import { WidgetType } from '@uiw/react-codemirror';
import { MODIFIERS_CLASS, VARIABLE_PILL_CLASS } from './constants';

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
    const pillClass = `${VARIABLE_PILL_CLASS} ${this.hasModifiers ? MODIFIERS_CLASS : ''}`;

    span.className = pillClass;

    // Stores the complete variable expression including any filters/transformers
    span.setAttribute('data-variable', this.fullVariableName);

    span.setAttribute('data-start', this.start.toString());
    span.setAttribute('data-end', this.end.toString());

    // Contains the clean variable name shown to the user
    span.setAttribute('data-display', this.variableName);

    span.textContent = this.variableName;

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // setTimeout is used to defer the selection until after CodeMirror's own click handling
      // This prevents race conditions where our selection might be immediately cleared by the editor
      setTimeout(() => {
        this.onSelect?.(this.fullVariableName, this.start, this.end);
      }, 0);
    };

    span.addEventListener('mousedown', handleClick);
    (span as any)._variableClickHandler = handleClick;

    return span;
  }

  /**
   * Determines if two VariablePillWidget instances are equal by comparing all their properties.
   * Used by CodeMirror to optimize re-rendering.
   */
  eq(other: VariablePillWidget) {
    return (
      other.variableName === this.variableName &&
      other.fullVariableName === this.fullVariableName &&
      other.start === this.start &&
      other.end === this.end &&
      other.hasModifiers === this.hasModifiers
    );
  }

  /**
   * Cleanup method called when the widget is being removed from the editor.
   * Removes event listeners to prevent memory leaks.
   */
  destroy(dom: HTMLElement) {
    if ((dom as any)._variableClickHandler) {
      dom.removeEventListener('mousedown', (dom as any)._variableClickHandler);
      delete (dom as any)._variableClickHandler;
    }
  }

  /**
   * Controls whether CodeMirror should handle events on this widget.
   * Returns false to allow events to propagate normally.
   */
  ignoreEvent() {
    return false;
  }
}
