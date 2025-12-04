import { css } from '@emotion/react';

export const container = css`
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 48px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 48px;
    font-family:
        -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
        Arial, sans-serif;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
        padding: 24px;
        gap: 32px;
    }
`;

export const sidebar = css`
    background: #f8f9fa;
    border-radius: 12px;
    padding: 24px;
    height: fit-content;
    position: sticky;
    top: 48px;

    @media (max-width: 900px) {
        position: static;
    }
`;

export const heading = css`
    margin: 0 0 20px 0;
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
`;

export const section = css`
    margin-bottom: 24px;
`;

export const subtitle = css`
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

export const current = css`
    padding: 12px 16px;
    background: white;
    border-radius: 8px;
    font-size: 14px;
    color: #1a1a1a;
    font-weight: 500;
`;

export const values = css`
    padding: 16px;
    background: white;
    border-radius: 8px;
    font-size: 13px;
    color: #666;
    font-family: 'Courier New', monospace;
    white-space: pre-wrap;
    overflow-x: auto;
`;

export const toast = {
    style: {
        fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
};
