import { app } from 'electron';

import { Window } from './Window';

app.allowRendererProcessReuse = true;

async function main() {
    new Window({
        file: `file://${__dirname}/index.html`,
        windowSettings: {},
    });
}

app.on('ready', main);
