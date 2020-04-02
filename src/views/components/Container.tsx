import React, { ChangeEvent, useState, RefObject } from 'react';
import styled from 'styled-components';

import Player from './Player';
import Canvas from './Canvas';
import { AudioHandler } from './AudioHandler';

type Props = {
    ready: boolean;
    handler: AudioHandler;
    frequencyC: RefObject<HTMLCanvasElement>;
    sinewaveC: RefObject<HTMLCanvasElement>;
};

export function Container({ ready, handler, frequencyC, sinewaveC }: Props) {
    const [volume, setVolume] = useState(1);
    const [position, setPosition] = useState(0);

    const play = async (): Promise<void> => {
        handler.setVolume(volume / 100);
        handler.play();
    };

    const stop = () => {
        handler.stop();
    };

    const pause = () => {
        handler.pause();
    };

    const nextsong = async () => {
        await handler.nextsong();
    };

    const lastsong = async () => {
        await handler.lastsong();
    };

    const handleChangeVolume = (e: ChangeEvent<HTMLInputElement>) => {
        setVolume(e.target.valueAsNumber);

        handler.setVolume(e.target.valueAsNumber / 100);
    };

    const handleChangePosition = (e: ChangeEvent<HTMLInputElement>) => {
        e.persist();

        setPosition(e.target.valueAsNumber);
    };

    return (
        <ContainerDiv>
            <Canvas
                display="both"
                frequencyC={frequencyC}
                sinewaveC={sinewaveC}
                frequencyCanvasStyles={{
                    width: '100%',
                    height: '100px',
                    background: 'rgba(0, 0, 0, 0.1)',
                }}
                sinewaveCanvasStyles={{
                    width: '100%',
                    height: '100px',
                    background: 'rgba(0, 0, 0, 0.1)',
                }}
                containerStyles={{
                    width: '100%',
                }}
            />

            <Player
                ready={ready}
                duration={handler.getDuration() ?? 0}
                position={position}
                handleChangePosition={handleChangePosition}
                nextsong={nextsong}
                lastsong={lastsong}
                handleChangeVolume={handleChangeVolume}
                play={play}
                stop={stop}
                pause={pause}
                volume={volume}
            />
        </ContainerDiv>
    );
}

const ContainerDiv = styled.div`
    background: rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    padding: 10px;
    min-height: 300px;
`;
