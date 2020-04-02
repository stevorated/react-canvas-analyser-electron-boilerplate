import React, { useRef, useEffect, useState } from 'react';
import dotenv from 'dotenv';
import path from 'path';

import { AudioHandler } from './components/AudioHandler';
import { Container } from './components';

const handler = new AudioHandler();
const { PATH } = dotenv.config().parsed || { PATH: '' };

const paths = [
    path.join(PATH, 'album/Is It Always Binary.mp3'),
    path.join(PATH, 'album/album_1/Fragments Master.mp3'),
    path.join(PATH, 'album/album_1/War Master.mp3'),
    path.join(PATH, 'album/album_1/2 Pieces Master.mp3'),
    path.join(PATH, 'album/album_1/Son of a Gun Master.mp3'),
];

export function App() {
    const [ready, setReady] = useState(false);
    const frequencyC = useRef<HTMLCanvasElement>(null);
    const sinewaveC = useRef<HTMLCanvasElement>(null);

    // canvas draw styles

    const styles = {
        fillStyle: 'rgba(200, 200, 200)',
        strokeStyle: 'rgba(0, 0,255)',
        lineWidth: 1.2,
        level: 100,
        fftSize: 4096, // delization of bars from 1024 to 32768
    };

    // componentDidMount like..
    useEffect(() => {
        const canvas = {
            frequencyC: frequencyC.current,
            sinewaveC: sinewaveC.current,
        };

        handler.loadFiles([paths[0]], canvas, styles).then(() => {
            // remove loader and slideIn player
            setTimeout(() => {
                setReady(true);
            }, 20);
            console.log('ready for use with first load');
        });

        const restOfPaths = paths.filter((_, index) => index !== 0);

        // for smooth user experience should be called in separate from loadFiles
        // as lazy loader

        handler.addFiles(restOfPaths).then(() => {
            console.log('loaded some more paths/urls...');
        });
    }, []);

    return <Container ready={ready} handler={handler} frequencyC={frequencyC} sinewaveC={sinewaveC} />;
}
