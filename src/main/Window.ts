import path from 'path';
import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';

import MenuBuilder from './Menu';

type Props = {
    file: string;
    windowSettings?: BrowserWindowConstructorOptions;
};

const defaultSettings: BrowserWindowConstructorOptions = {
    width: 1000,
    height: 600,
    minWidth: 1000,
    icon: path.join(__dirname, '/icon.png'),
    webPreferences: {
        nodeIntegration: true,
        preload: path.join('./bundle.min.js'),
    },
};

export class Window extends BrowserWindow {
    private menuBuilder: MenuBuilder;

    constructor({ file, windowSettings }: Props) {
        super({ ...defaultSettings, ...windowSettings });

        this.loadURL(file);

        this.menuBuilder = new MenuBuilder(this);
        this.menuBuilder.buildMenu();

        if (process.env.NODE_ENV === 'development') {
            this.webContents.openDevTools();
        }
    }
}
