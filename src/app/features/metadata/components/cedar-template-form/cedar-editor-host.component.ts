import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';

import { ENVIRONMENT } from '@core/provider/environment.provider';

import { CedarEditorContext, CedarEditorElement } from '../../models';

const DEFAULT_EDITOR_ELEMENT_NAME = 'cedar-embeddable-editor';
const CUSTOM_ELEMENT_NAME_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)+$/;
const loadedEditorScripts = new Map<string, Promise<void>>();

@Component({
  selector: 'osf-cedar-editor-host',
  template: '<div #host></div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CedarEditorHostComponent {
  config = input.required<unknown>();
  context = input.required<CedarEditorContext>();
  templateObject = input.required<unknown>();
  metadata = input.required<unknown>();
  editorChange = output<Event>();

  private readonly environment = inject(ENVIRONMENT);
  private readonly document = inject(DOCUMENT);
  private readonly host = viewChild.required<ElementRef<HTMLDivElement>>('host');
  private editor?: CedarEditorElement;
  private pendingInstanceObject?: unknown;

  constructor() {
    effect(() => {
      const config = this.config();
      const context = this.context();
      const templateObject = this.templateObject();
      const metadata = this.metadata();

      if (this.editor) {
        this.editor.config = config;
        this.editor.context = context;
        this.editor.templateObject = templateObject;
        this.editor.metadata = metadata;
      }
    });

    afterNextRender(() => void this.mountEditor());
  }

  get currentMetadata(): unknown {
    return this.editor?.currentMetadata;
  }

  get dataQualityReport(): CedarEditorElement['dataQualityReport'] {
    return this.editor?.dataQualityReport;
  }

  set instanceObject(value: unknown) {
    this.pendingInstanceObject = value;
    if (this.editor) this.editor.instanceObject = value;
  }

  private async mountEditor(): Promise<void> {
    const editorElementName = await this.resolveEditorElementName();
    const editor = this.document.createElement(editorElementName) as CedarEditorElement;

    editor.config = this.config();
    editor.context = this.context();
    editor.templateObject = this.templateObject();
    editor.metadata = this.metadata();
    if (this.pendingInstanceObject !== undefined) {
      editor.instanceObject = this.pendingInstanceObject;
    }

    for (const eventName of ['change', 'pointerover', 'keyup']) {
      editor.addEventListener(eventName, (event) => this.editorChange.emit(event));
    }

    this.editor = editor;
    this.host().nativeElement.replaceChildren(editor);
  }

  private async resolveEditorElementName(): Promise<string> {
    const elementName = this.environment.cedarEditorElementName?.trim();
    const scriptUrl = this.environment.cedarEditorScriptUrl?.trim();

    if (!elementName && !scriptUrl) return DEFAULT_EDITOR_ELEMENT_NAME;
    if (!elementName || !scriptUrl || !CUSTOM_ELEMENT_NAME_PATTERN.test(elementName)) {
      throw new Error('Invalid external CEDAR editor configuration');
    }

    if (this.document.defaultView?.customElements.get(elementName)) return elementName;

    await this.loadSameOriginScript(scriptUrl);
    if (!this.document.defaultView?.customElements.get(elementName)) {
      throw new Error(`Script did not register <${elementName}>`);
    }
    return elementName;
  }

  private loadSameOriginScript(scriptUrl: string): Promise<void> {
    const url = new URL(scriptUrl, this.document.baseURI);
    if (url.origin !== this.document.location.origin) {
      return Promise.reject(new Error('External CEDAR editor scripts must use the application origin.'));
    }

    const existing = loadedEditorScripts.get(url.href);
    if (existing) return existing;

    const loading = new Promise<void>((resolve, reject) => {
      const script = this.document.createElement('script');
      script.src = url.href;
      script.type = 'module';
      script.addEventListener('load', () => resolve(), { once: true });
      script.addEventListener('error', () => reject(new Error(`Unable to load ${url.pathname}`)), { once: true });
      this.document.head.appendChild(script);
    }).catch((error) => {
      loadedEditorScripts.delete(url.href);
      throw error;
    });

    loadedEditorScripts.set(url.href, loading);
    return loading;
  }
}
