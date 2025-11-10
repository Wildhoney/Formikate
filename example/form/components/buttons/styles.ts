import { css } from '@emotion/react';

export const container = css`
    display: flex;
    gap: 12px;
    margin-top: 32px;
`;

export const back = css`
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 500;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background: white;
    color: #1a1a1a;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
        background: #f9fafb;
        border-color: #9ca3af;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

export const submit = css`
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 500;
    border: none;
    border-radius: 8px;
    background: #3b82f6;
    color: white;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
        background: #2563eb;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

export const reset = css`
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 500;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background: white;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
        background: #f9fafb;
        border-color: #9ca3af;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;
