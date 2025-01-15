import { WidgetType } from '@uiw/react-codemirror';
import { FILTERS_CLASS, VARIABLE_PILL_CLASS } from './';

export class VariablePillWidget extends WidgetType {
  private clickHandler: (e: MouseEvent) => void;

  constructor(
    private variableName: string,
    private fullVariableName: string,
    private start: number,
    private end: number,
    private hasFilters: boolean,
    private onSelect?: (value: string, from: number, to: number) => void
  ) {
    super();
    this.clickHandler = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // setTimeout is used to defer the selection until after CodeMirror's own click handling
      // This prevents race conditions where our selection might be immediately cleared by the editor
      setTimeout(() => {
        this.onSelect?.(this.fullVariableName, this.start, this.end);
      }, 0);
    };
  }

  toDOM() {
    const span = document.createElement('span');
    const pillClass = `${VARIABLE_PILL_CLASS} ${this.hasFilters ? FILTERS_CLASS : ''}`;

    span.className = pillClass;

    // Stores the complete variable expression including any filters
    span.setAttribute('data-variable', this.fullVariableName);

    span.setAttribute('data-start', this.start.toString());
    span.setAttribute('data-end', this.end.toString());

    // Contains the clean variable name shown to the user
    span.setAttribute('data-display', this.variableName);

    span.textContent = this.variableName;

    span.addEventListener('mousedown', this.clickHandler);

    return span;
  }

  /**
   * Determines if two VariablePillWidget instances are equal by comparing all their properties.
   * Used by CodeMirror to optimize re-rendering.
   */
  eq(other: VariablePillWidget) {
    return other.fullVariableName === this.fullVariableName && other.start === this.start && other.end === this.end;
  }

  /**
   * Cleanup method called when the widget is being removed from the editor.
   * Removes event listeners to prevent memory leaks.
   */
  destroy(dom: HTMLElement) {
    dom.removeEventListener('mousedown', this.clickHandler);
  }

  /**
   * Controls whether CodeMirror should handle events on this widget.
   * Returns false to allow events to propagate normally.
   */
  ignoreEvent() {
    return false;
  }
}
