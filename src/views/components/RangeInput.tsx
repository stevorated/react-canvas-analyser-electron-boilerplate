import React, { ChangeEvent } from 'react';
import styled from 'styled-components';

type Props = {
    value: number;
    max: number;
    min?: number;
    id?: string;
    name?: string;
    width?: string;
    maxText?: string;
    minText?: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export function RangeInput({
    id,
    name,
    min,
    max,
    value,
    onChange,
    maxText,
    minText,
    width,
}: Props) {
    return (
        <ContainerDiv>
            <Span>{min ?? 0}</Span>
            <Range
                id={id}
                type="range"
                name={name}
                max={maxText ?? max}
                min={minText ?? min ?? 0}
                value={value}
                onChange={onChange}
                width={width}
            />
            <Span>{max}</Span>
        </ContainerDiv>
    );
}

const ContainerDiv = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Span = styled.span`
    margin: 0 4px;
`;

const Range = styled.input`
    margin: 0 2px;
    width: ${({ width }: { width?: string }) => width};
`;
