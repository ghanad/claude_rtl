// ==UserScript==
// @name         Google AI Studio RTL
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Makes Persian text RTL and applies Vazir font to whole paragraphs
// @author       Your name
// @match        https://aistudio.google.com/*
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
    const fontLink = document.createElement('link');
    fontLink.href = 'https://cdn.jsdelivr.net/gh/rastikerdar/vazir-font@v30.1.0/dist/font-face.css';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
    @font-face {
        font-family: Vazir;
        src: url('https://cdn.jsdelivr.net/gh/rastikerdar/vazir-font@v30.1.0/dist/Vazir-Regular.woff2') format('woff2');
        font-weight: normal;
        font-display: swap;
    }

    ms-cmark-node {
        display: block !important;
    }

    .rtl-paragraph {
        display: block !important;
        text-align: right !important;
        direction: rtl !important;
        font-family: Vazir, Tahoma, system-ui !important;
        line-height: 1.8 !important;
    }

    pre,
    code,
    .hljs,
    [role="code"],
    .markdown-code,
    pre *,
    code *,
    .hljs *,
    [role="code"] *,
    .markdown-code * {
        direction: ltr !important;
        text-align: left !important;
        font-family: monospace !important;
    }

    pre .rtl-paragraph,
    code .rtl-paragraph,
    .hljs .rtl-paragraph,
    [role="code"] .rtl-paragraph,
    .markdown-code .rtl-paragraph {
        direction: ltr !important;
        text-align: left !important;
        font-family: monospace !important;
    }
`;

    document.head.appendChild(styleSheet);

    function hasPersianText(text) {
        return /[\u0600-\u06FF]/.test(text);
    }

    function isCodeBlock(element) {
        let parent = element;
        while (parent) {
            if (
                parent.tagName === 'PRE' ||
                parent.tagName === 'CODE' ||
                parent.classList.contains('hljs') ||
                parent.classList.contains('code-block') ||
                parent.classList.contains('markdown-code') ||
                parent.getAttribute('role') === 'code' ||
                parent.closest('pre, code') !== null
            ) {
                return true;
            }
            parent = parent.parentElement;
        }
        return false;
    }

    function makeRTL() {
        document.querySelectorAll('ms-cmark-node:not([data-rtl-checked])').forEach(node => {
            const isCode = isCodeBlock(node);
            const hasCode = node.querySelector('pre, code') !== null;

            if (!isCode && !hasCode) {
                const textContent = node.textContent;
                if (hasPersianText(textContent)) {
                    node.classList.add('rtl-paragraph');
                    // اعمال استایل به span های داخلی
                    node.querySelectorAll('span').forEach(span => {
                        if (!isCodeBlock(span)) {
                            span.style.direction = 'inherit';
                            span.style.textAlign = 'inherit';
                            span.style.display = 'inline';
                        }
                    });
                }
            }
            node.setAttribute('data-rtl-checked', 'true');
        });
    }

    makeRTL();

    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                makeRTL();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    setInterval(makeRTL, 1000);
})();
