import { css } from '@emotion/react';

export const container = css`
    margin-bottom: 24px;
`;

export const label = css`
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #1a1a1a;
`;

export const required = css`
    color: #ef4444;
    margin-left: 4px;
`;

export const input = css`
    width: 100%;
    padding: 12px 16px;
    font-size: 14px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
        border-color: #3b82f6;
    }

    &::placeholder {
        color: #9ca3af;
    }
`;

export const error = css`
    margin-top: 6px;
    font-size: 13px;
    color: #ef4444;
`;
