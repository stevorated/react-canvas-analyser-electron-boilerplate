import { Menu, shell } from 'electron';
import { Window } from './Window';

export default class MenuBuilder {
    private mainWindow: Window;

    constructor(mainWindow: Window) {
        this.mainWindow = mainWindow;
    }

    buildMenu() {
        if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
            this.setupDevelopmentEnvironment();
        }

        const menu = Menu.buildFromTemplate(this.buildDefaultTemplate());
        Menu.setApplicationMenu(menu);

        return menu;
    }

    setupDevelopmentEnvironment() {
        this.mainWindow.webContents.on('context-menu', (_, context) => {
            const { x, y } = context;

            Menu.buildFromTemplate([
                {
                    label: 'Inspect element',
                    click: () => {
                        this.mainWindow.webContents.inspectElement(x, y);
                    },
                },
            ]).popup({ window: this.mainWindow });
        });
    }

    buildDefaultTemplate() {
        const fileDefault: Electron.MenuItemConstructorOptions = {
            label: '&File',
            accelerator: 'Ctrl+F',
            submenu: [
                {
                    label: '&New...',
                    accelerator: 'Ctrl+N',
                    click: () => {},
                },
                {
                    label: '&Add...',
                    accelerator: 'Ctrl+S',
                    click: () => {},
                },
                { type: 'separator' },
                {
                    label: '&Prefrences...',
                    accelerator: 'Ctrl+,',
                    click: () => {},
                },
                { type: 'separator' },
                {
                    label: '&Close',
                    accelerator: 'Ctrl+W',
                    click: () => {
                        this.mainWindow.close();
                    },
                },
            ],
        };

        const viewDevMenu: Electron.MenuItemConstructorOptions[] =
            process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true'
                ? [
                      {
                          label: '&Reload',
                          accelerator: 'Ctrl+R',
                          click: () => {
                              this.mainWindow.webContents.reload();
                          },
                      },
                      {
                          label: 'Toggle &Developer Tools',
                          accelerator: 'Ctrl+I',
                          click: () => {
                              this.mainWindow.webContents.toggleDevTools();
                          },
                      },
                  ]
                : [];

        let templateDefault: Electron.MenuItemConstructorOptions[] = [
            fileDefault,
            {
                label: '&View',
                type: 'submenu',
                submenu: [
                    {
                        label: 'Toggle &Full Screen',
                        accelerator: 'F11',
                        click: () => {
                            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
                        },
                    },
                    { type: 'separator' },
                    {
                        label: 'Appearance',
                        type: 'submenu',
                        submenu: [
                            {
                                label: 'Show Sidebar',
                                accelerator: 'Ctrl+B',
                                type: 'checkbox',
                                checked: true,
                                click: () => {},
                            },
                        ],
                    },
                    ...viewDevMenu,
                ],
            },
            {
                label: '&About',
                submenu:
                    process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true'
                        ? [
                              {
                                  label: 'Google',
                                  click() {
                                      shell.openExternal('https://google.com');
                                  },
                              },
                          ]
                        : [
                              {
                                  label: 'About me…',
                                  click() {
                                      shell.openExternal('https://shirelgarber.com');
                                  },
                              },
                          ],
            },
        ];

        return templateDefault;
    }
}
