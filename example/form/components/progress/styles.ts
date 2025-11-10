import { css } from '@emotion/react';

export const container = css`
    display: flex;
    gap: 8px;
`;

export const item = (isCurrent: boolean) => css`
    padding: 8px 12px;
    background: ${isCurrent ? '#3b82f6' : 'white'};
    color: ${isCurrent ? 'white' : '#6b7280'};
    border: 1px solid ${isCurrent ? '#3b82f6' : '#e5e7eb'};
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    text-transform: capitalize;
`;
