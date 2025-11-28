import { Clipboard } from '@angular/cdk/clipboard';

import { FileMenuContext, FileMenuExtension } from '@osf/shared/tokens/file-menu-extensions.token';

export function copyLinksExtensionFactory(fileMenuContext: FileMenuContext, clipboard: Clipboard): FileMenuExtension[] {
  return [
    {
      item: {
        id: 'copy-link',
        label: 'Copy Link',
        icon: 'fas fa-link',
        command: () => {
          const file = fileMenuContext.currentFile();
          if (file) {
            clipboard.copy(file.links.html);
          }
        },
      },
      position: 1,
      showForFolder: false,
      showInViewOnly: true,
    },
  ];
}
