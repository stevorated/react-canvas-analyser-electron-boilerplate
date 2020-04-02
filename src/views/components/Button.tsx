import React, { ReactNode } from 'react';
import styled from 'styled-components';

type Props = {
    icon: ReactNode;
    disabled?: boolean;
    onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

export function Button({ icon, disabled, onClick }: Props) {
    return (
        <ButtonStyle disabled={disabled} onClick={onClick}>
            {icon}
        </ButtonStyle>
    );
}

const ButtonStyle = styled.button`
    display: block;
    height: 40px;
    width: 40px;
    padding: 0;
    border-radius: 50%;
    margin: 0 6px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid grey;
    transition: all 0.1s linear;

    &:hover {
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(3px);
    }

    &:focus {
        outline: none;
    }
`;
