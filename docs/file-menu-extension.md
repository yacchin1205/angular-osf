# File Menu Extension

This document describes how to add custom menu items to the file context menu using the plugin architecture.

## Overview

The `FileMenuComponent` supports external menu extensions via Angular's dependency injection. Extensions are registered using the `FILE_MENU_EXTENSIONS` token and automatically merged into the existing menu.

## How to Add a Custom Menu Item

### 1. Create an Extension Factory

```typescript
// src/app/extensions/my-feature/my-menu.ts

import { Clipboard } from '@angular/cdk/clipboard';
import { FileMenuExtension, FileMenuContext } from '@osf/shared/tokens/file-menu-extensions.token';

export function myMenuExtensionFactory(fileMenuContext: FileMenuContext, clipboard: Clipboard): FileMenuExtension[] {
  return [
    {
      item: {
        id: 'my-action',
        label: 'My Action',
        icon: 'fas fa-star',
        command: () => {
          const file = fileMenuContext.currentFile();
          if (file) {
            // Do something with file
            console.log(file.name, file.links.html);
          }
        },
      },
      position: 1, // 0 = first, 'end' = last
      showForFolder: false, // Show for folders?
      showInViewOnly: true, // Show in view-only mode?
    },
  ];
}
```

### 2. Register in app.config.ts

```typescript
import { FILE_MENU_EXTENSIONS, FileMenuContext } from '@osf/shared/tokens/file-menu-extensions.token';
import { myMenuExtensionFactory } from './extensions/my-feature/my-menu';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers

    {
      provide: FILE_MENU_EXTENSIONS,
      useFactory: myMenuExtensionFactory,
      deps: [FileMenuContext, Clipboard],
      multi: true,
    },
  ],
};
```

## FileMenuExtension Interface

```typescript
interface FileMenuExtension {
  item: MenuItem; // PrimeNG MenuItem
  position?: 'start' | 'end' | number; // Where to insert (default: 'end')
  showForFolder?: boolean; // Show for folders (default: false)
  showInViewOnly?: boolean; // Show in view-only mode (default: true)
}
```

## Accessing File Information

Use `FileMenuContext` to access the current file in your `command` callback:

```typescript
const file = fileMenuContext.currentFile();

// Example properties:
file.name; // "example.txt"
file.links.html; // "https://osf.io/xxxxx/"
file.links.download; // "https://..."
file.kind; // "file" or "folder"

// See FileModel interface for all available properties:
// src/app/shared/models/files/file.model.ts
```

## Example: Copy Link Extension

See `src/app/extensions/copy-links/` for a working example.

## File Structure

```
src/app/
├── shared/tokens/
│   └── file-menu-extensions.token.ts   # Token & FileMenuContext
│
└── extensions/                          # Put your extensions here
    └── copy-links/
        ├── index.ts
        └── copy-links-menu.ts
```
