import React, { RefObject, CSSProperties } from 'react';
import styled, { keyframes } from 'styled-components';

type Props = {
    frequencyC?: RefObject<HTMLCanvasElement>;
    sinewaveC?: RefObject<HTMLCanvasElement>;
    frequencyCanvasStyles?: CSSProperties;
    sinewaveCanvasStyles?: CSSProperties;
    width?: number;
    height?: number;
    display: Display;
    containerStyles?: CSSProperties;
};

type Display = 'both' | 'freq' | 'sine';

export default function Canvas({
    frequencyC,
    sinewaveC,
    frequencyCanvasStyles,
    sinewaveCanvasStyles,
    width,
    height,
    display = 'both',
    containerStyles,
}: Props) {
    return (
        <ContainerDiv style={{ ...containerStyles }}>
            {display !== 'sine' && (
                <canvas
                    ref={frequencyC}
                    width={width ? `${width}px` : '1024'}
                    height={height ? `${height}px` : '150'}
                    style={{ ...frequencyCanvasStyles }}
                ></canvas>
            )}
            {display !== 'freq' && (
                <canvas
                    ref={sinewaveC}
                    width={width ? `${width}px` : '1024'}
                    height={height ? `${height}px` : '150'}
                    style={{ ...sinewaveCanvasStyles }}
                ></canvas>
            )}
        </ContainerDiv>
    );
}

const fadeIn = keyframes`
from {
    opacity: 0;
}
to {
    opacity: 1;
}

`;

const ContainerDiv = styled.div`
    animation-name: ${fadeIn};
    animation-duration: 8000ms;
`;
