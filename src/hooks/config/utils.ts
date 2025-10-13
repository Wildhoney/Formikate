export function defer(run: () => void): void {
    requestAnimationFrame(() => {
        requestAnimationFrame(run);
    });
}
