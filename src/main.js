/* -Copyright Glow.JS / 2024 */
/* -Copyright Glow.JS / 2024 */
/* -Copyright Glow.JS / 2024 */

class GlowJS {
    constructor() {
        this.defaultOptions = {
            type: 'radial', // 'radial' or 'linear'
            colors: ['#ff00ff'], // array of colors for gradient
            size: '10px',
            duration: '1s',
            intensity: '0.5',
            event: 'hover',
            repeat: 'infinite', // 'infinite' or number of repetitions
            delay: '0s', // delay before animation starts
            direction: 'alternate', // 'normal', 'reverse', 'alternate', 'alternate-reverse'
            timingFunction: 'ease-in-out' // CSS timing function
        };
        this.keyframeCounter = 0;
        this.dynamicElements = new Map();
        this.styleSheet = this.createStyleSheet();
    }

    createStyleSheet() {
        const style = document.createElement("style");
        document.head.appendChild(style);
        return style.sheet;
    }

    generateKeyframes(options) {
        const keyframesName = `glow${this.keyframeCounter++}`;

        const gradient = options.type === 'linear' ?
            `linear-gradient(45deg, ${options.colors.join(', ')})` :
            `radial-gradient(circle, ${options.colors.join(', ')})`;

        const glowStyle = `
            0 0 ${options.size} ${gradient},
            0 0 ${parseFloat(options.size) * 2}px ${gradient},
            0 0 ${parseFloat(options.size) * 3}px ${gradient}`;

        const cssAnimation = `
            @keyframes ${keyframesName} {
                0% { box-shadow: ${glowStyle}; }
                50% { box-shadow: 0 0 ${parseFloat(options.size) * 5}px rgba(0, 0, 0, ${options.intensity * 0.1}); }
                100% { box-shadow: ${glowStyle}; }
            }
        `;

        this.styleSheet.insertRule(cssAnimation, this.styleSheet.cssRules.length);

        return keyframesName;
    }

    applyGlow(element, options) {
        options = { ...this.defaultOptions, ...options };
        const keyframesName = this.generateKeyframes(options);

        const applyStyle = () => {
            element.style.animation = `${keyframesName} ${options.duration} ${options.delay} ${options.repeat} ${options.direction}`;
            element.style.animationTimingFunction = options.timingFunction;
        };

        const removeStyle = () => {
            element.style.animation = '';
        };

        const eventHandlers = {
            hover: () => {
                element.addEventListener('mouseover', applyStyle);
                element.addEventListener('mouseout', removeStyle);
            },
            click: () => {
                element.addEventListener('click', applyStyle);
            },
            focus: () => {
                element.addEventListener('focus', applyStyle);
                element.addEventListener('blur', removeStyle);
            },
            scroll: () => {
                window.addEventListener('scroll', () => {
                    if (this.isElementInViewport(element)) {
                        applyStyle();
                    } else {
                        removeStyle();
                    }
                });
            },
            default: applyStyle
        };

        (eventHandlers[options.event] || eventHandlers.default)();
        this.dynamicElements.set(element, { applyStyle, removeStyle });
    }

    isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    glow(elements, options) {
        if (elements instanceof NodeList || Array.isArray(elements)) {
            elements.forEach(element => this.applyGlow(element, options));
        } else if (elements instanceof HTMLElement) {
            this.applyGlow(elements, options);
        } else {
            console.error('Invalid element(s) provided to GlowJS.glow');
        }
    }

    stopGlow(elements) {
        if (elements instanceof NodeList || Array.isArray(elements)) {
            elements.forEach(element => this.removeGlow(element));
        } else if (elements instanceof HTMLElement) {
            this.removeGlow(elements);
        } else {
            console.error('Invalid element(s) provided to GlowJS.stopGlow');
        }
    }

    removeGlow(element) {
        if (this.dynamicElements.has(element)) {
            const { removeStyle } = this.dynamicElements.get(element);
            removeStyle();
            this.dynamicElements.delete(element);
        }
    }

    addDynamicGlow(selector, options) {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && node.matches(selector)) {
                            this.applyGlow(node, options);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    updateGlow(element, newOptions) {
        this.removeGlow(element);
        this.applyGlow(element, newOptions);
    }

    glowOnCondition(elements, conditionCallback, options) {
        elements.forEach(element => {
            if (conditionCallback(element)) {
                this.applyGlow(element, options);
            }
        });
    }

    removeAllGlowEffects() {
        this.dynamicElements.forEach(({ removeStyle }, element) => {
            removeStyle();
        });
        this.dynamicElements.clear();
    }
}

const glowJS = new GlowJS();

// Usage Example
document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.glow');
    glowJS.glow(elements, { type: 'linear', colors: ['#00ff00', '#ff4500'], size: '20px', duration: '2s', intensity: '0.7', event: 'hover', direction: 'alternate-reverse', timingFunction: 'ease-in-out' });

    // Apply glow effect to dynamically added elements
    glowJS.addDynamicGlow('.dynamic-glow', { type: 'radial', colors: ['#00f', 'transparent'], size: '15px', duration: '1.5s', intensity: '0.8', event: 'click' });

    // Example of updating the glow effect
    const elementToUpdate = document.querySelector('#elementToUpdate');
    glowJS.updateGlow(elementToUpdate, { type: 'linear', colors: ['#ff0000', '#0000ff'], size: '25px', duration: '1s', intensity: '0.9', event: 'focus', direction: 'normal', timingFunction: 'linear' });

    // Example of applying glow based on a condition
    const conditionalElements = document.querySelectorAll('.conditional-glow');
    glowJS.glowOnCondition(conditionalElements, (element) => element.textContent.includes('Glow'), { type: 'radial', colors: ['#ff00ff', '#ffff00'], size: '15px', duration: '3s', intensity: '0.6', event: 'scroll', direction: 'alternate', timingFunction: 'ease-out' });

    // Remove all glow effects when needed
    // glowJS.removeAllGlowEffects();
});
