// Polyfills for jsdom (required by Ant Design)
window.matchMedia = window.matchMedia || function matchMediaMock(query: string) {
    return {
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    };
} as any;

window.ResizeObserver = window.ResizeObserver || class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
} as any;

window.getComputedStyle = window.getComputedStyle || (() => ({})) as any;
