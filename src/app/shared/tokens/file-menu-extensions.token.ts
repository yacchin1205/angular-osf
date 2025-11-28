import { MenuItem } from 'primeng/api';

import { Injectable, InjectionToken, signal } from '@angular/core';

import { FileModel } from '@osf/shared/models/files/file.model';

export interface FileMenuExtension {
  /** PrimeNG MenuItem */
  item: MenuItem;

  /**
   * Position to insert the menu item
   * - 'start': beginning
   * - 'end': end (default)
   * - number: specific index
   */
  position?: 'start' | 'end' | number;

  /** Show for folders (default: false) */
  showForFolder?: boolean;

  /** Show in view-only mode (default: true) */
  showInViewOnly?: boolean;
}

export const FILE_MENU_EXTENSIONS = new InjectionToken<FileMenuExtension[]>('FileMenuExtensions');

/**
 * Holds the current file context for menu extensions.
 * Use this to access file information in command callbacks.
 */
@Injectable({
  providedIn: 'root',
})
export class FileMenuContext {
  private readonly _currentFile = signal<FileModel | null>(null);

  readonly currentFile = this._currentFile.asReadonly();

  /** @internal Called by FileMenuComponent */
  setCurrentFile(file: FileModel | null): void {
    this._currentFile.set(file);
  }
}
