import { TranslatePipe } from '@ngx-translate/core';

import { MenuItem } from 'primeng/api';
import { Button } from 'primeng/button';
import { TieredMenu } from 'primeng/tieredmenu';

import { Component, computed, inject, input, output, viewChild } from '@angular/core';
import { Router } from '@angular/router';

import { FileMenuType } from '@osf/shared/enums/file-menu-type.enum';
import { hasViewOnlyParam } from '@osf/shared/helpers/view-only.helper';
import { FileModel } from '@osf/shared/models/files/file.model';
import { MenuManagerService } from '@osf/shared/services/menu-manager.service';
import {
  FILE_MENU_EXTENSIONS,
  FileMenuContext,
  FileMenuExtension,
} from '@osf/shared/tokens/file-menu-extensions.token';
import { FileMenuAction, FileMenuData, FileMenuFlags } from '@shared/models/files/file-menu-action.model';

@Component({
  selector: 'osf-file-menu',
  imports: [Button, TieredMenu, TranslatePipe],
  templateUrl: './file-menu.component.html',
  styleUrl: './file-menu.component.scss',
})
export class FileMenuComponent {
  private router = inject(Router);
  private menuManager = inject(MenuManagerService);
  private fileMenuContext = inject(FileMenuContext);
  private extensions = inject(FILE_MENU_EXTENSIONS, { optional: true }) ?? [];

  file = input<FileModel>();
  isFolder = input<boolean>(false);
  allowedActions = input<FileMenuFlags>({} as FileMenuFlags);
  menu = viewChild.required<TieredMenu>('menu');
  action = output<FileMenuAction>();

  hasViewOnly = computed(() => hasViewOnlyParam(this.router));

  private readonly allMenuItems: MenuItem[] = [
    {
      id: FileMenuType.Download,
      label: 'common.buttons.download',
      icon: 'fas fa-download',
      command: () => this.emitAction(FileMenuType.Download),
    },
    {
      id: FileMenuType.Share,
      label: 'common.buttons.share',
      icon: 'fas fa-share',
      items: [
        {
          id: `${FileMenuType.Share}-email`,
          label: 'files.detail.actions.share.email',
          icon: 'fas fa-envelope',
          command: () => this.emitAction(FileMenuType.Share, { type: 'email' }),
        },
        {
          id: `${FileMenuType.Share}-twitter`,
          label: 'files.detail.actions.share.x',
          icon: 'fab fa-square-x-twitter',
          command: () => this.emitAction(FileMenuType.Share, { type: 'twitter' }),
        },
        {
          id: `${FileMenuType.Share}-facebook`,
          label: 'files.detail.actions.share.facebook',
          icon: 'fab fa-facebook',
          command: () => this.emitAction(FileMenuType.Share, { type: 'facebook' }),
        },
      ],
    },
    {
      id: FileMenuType.Embed,
      label: 'common.buttons.embed',
      icon: 'fas fa-code',
      items: [
        {
          id: `${FileMenuType.Embed}-dynamic`,
          label: 'files.detail.actions.copyDynamicIframe',
          icon: 'fas fa-file-code',
          command: () => this.emitAction(FileMenuType.Embed, { type: 'dynamic' }),
        },
        {
          id: `${FileMenuType.Embed}-static`,
          label: 'files.detail.actions.copyStaticIframe',
          icon: 'fas fa-file-code',
          command: () => this.emitAction(FileMenuType.Embed, { type: 'static' }),
        },
      ],
    },
    {
      id: FileMenuType.Rename,
      label: 'common.buttons.rename',
      icon: 'fas fa-edit',
      command: () => this.emitAction(FileMenuType.Rename),
    },
    {
      id: FileMenuType.Move,
      label: 'common.buttons.move',
      icon: 'fas fa-arrows-alt',
      command: () => this.emitAction(FileMenuType.Move),
    },
    {
      id: FileMenuType.Copy,
      label: 'common.buttons.copyTo',
      icon: 'fas fa-copy',
      command: () => this.emitAction(FileMenuType.Copy),
    },
    {
      id: FileMenuType.Delete,
      label: 'common.buttons.delete',
      icon: 'fas fa-trash',
      command: () => this.emitAction(FileMenuType.Delete),
    },
  ];

  menuItems = computed(() => {
    let items: MenuItem[];

    if (this.hasViewOnly()) {
      const allowedActionsForFiles = [
        FileMenuType.Download,
        FileMenuType.Embed,
        FileMenuType.Share,
        FileMenuType.Copy,
      ].filter((action) => this.allowedActions()[action]);

      const allowedActionsForFolders = [FileMenuType.Download, FileMenuType.Copy].filter(
        (action) => this.allowedActions()[action]
      );

      const allowedActions = this.isFolder() ? allowedActionsForFolders : allowedActionsForFiles;

      items = this.allMenuItems.filter((item) => {
        if (item.command) {
          return allowedActions.includes(item.id as FileMenuType);
        }

        if (item.items) {
          return allowedActions.includes(item.id as FileMenuType);
        }

        return false;
      });
    } else if (this.isFolder()) {
      const disallowedActions = [FileMenuType.Share, FileMenuType.Embed];
      items = this.allMenuItems.filter(
        (item) => !disallowedActions.includes(item.id as FileMenuType) && this.allowedActions()[item.id as FileMenuType]
      );
    } else {
      items = this.allMenuItems.filter((item) => this.allowedActions()[item.id as FileMenuType]);
    }

    return this.mergeExtensions(items);
  });

  private mergeExtensions(baseItems: MenuItem[]): MenuItem[] {
    const applicableExtensions = this.extensions.flat().filter((ext) => this.isExtensionApplicable(ext));

    let items = [...baseItems];

    for (const ext of applicableExtensions) {
      const { item, position = 'end' } = ext;

      if (position === 'start') {
        items = [item, ...items];
      } else if (position === 'end') {
        items = [...items, item];
      } else if (typeof position === 'number') {
        items = [...items.slice(0, position), item, ...items.slice(position)];
      }
    }

    return items;
  }

  private isExtensionApplicable(ext: FileMenuExtension): boolean {
    if (this.isFolder() && !ext.showForFolder) {
      return false;
    }
    if (this.hasViewOnly() && ext.showInViewOnly === false) {
      return false;
    }
    return true;
  }

  onMenuToggle(event: Event): void {
    this.fileMenuContext.setCurrentFile(this.file() ?? null);
    this.menuManager.openMenu(this.menu(), event);
  }

  onMenuHide(): void {
    this.menuManager.onMenuHide();
  }

  private emitAction(value: FileMenuType, data?: FileMenuData): void {
    this.action.emit({ value, data } as FileMenuAction);
  }
}
