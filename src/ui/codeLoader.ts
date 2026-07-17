import { extractHeaderComment } from "../parsers/headerParser.js";

type CodeLoaderOptions = {
    rootSelector: string;
    defaultLanguage?: string;
    moreInfoSelector?: string;
};

export function initCodeLoader(
    category: string,
    algorithmName: string,
    options: CodeLoaderOptions
) {
    const {
        rootSelector,
        defaultLanguage = "python",
        moreInfoSelector
    } = options;

    const root = document.querySelector(rootSelector) as HTMLElement | null;
    if (!root) return;

    const codeDisplay = root.querySelector(".code-display-target") as HTMLElement | null;
    const langButtons = root.querySelectorAll(".lang-btn");

    if (!codeDisplay || langButtons.length === 0) return;
    const codeDisplayEl = codeDisplay;

    async function loadCode(language: string) {

        try {
            const path = buildPath(language, category, algorithmName);
            const response = await fetch(path);

            if (!response.ok) { 
                codeDisplayEl.textContent = "File not found.";
                return;
            }

            const text = await response.text();
            const { header, body } = extractHeaderComment(text, language);

            if (moreInfoSelector) {
                injectHeaderIntoMoreInfo(header, moreInfoSelector);
            }

            codeDisplayEl.innerHTML = highlightCode(body, language);

        } catch {
            codeDisplayEl.textContent = "Error loading file.";
        }
    }

    langButtons.forEach(btn => {
        btn.addEventListener("click", () => {

            langButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const lang = btn.getAttribute("data-lang")!;
            loadCode(lang);
        });
    });

    loadCode(defaultLanguage);

    initCopyButton(root);
}

export async function copyText(text: string): Promise<void> {
    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return;
        } catch {
            // hm .... idk I MEAN this should work so ...
        }
    }

    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "true");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    textArea.style.pointerEvents = "none";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand("copy");
    } finally {
        document.body.removeChild(textArea);
    }
}

export function showCopySuccess(copyBtn: HTMLButtonElement): void {
    const tooltip = copyBtn.querySelector(".tooltip") as HTMLElement | null;
    const resetDelayMs = 3000;

    copyBtn.classList.add("copied");

    if (tooltip) {
        tooltip.setAttribute("data-text-initial", "Copied!");
    }

    const existingTimeout = copyBtn.dataset.copyResetTimeout;
    if (existingTimeout) {
        window.clearTimeout(Number(existingTimeout));
    }

    const timeoutId = window.setTimeout(() => {
        copyBtn.classList.remove("copied");

        if (tooltip) {
            tooltip.setAttribute("data-text-initial", "Copy to clipboard");
        }

        delete copyBtn.dataset.copyResetTimeout;
    }, resetDelayMs);

    copyBtn.dataset.copyResetTimeout = String(timeoutId);
}

function toPascalCase(name: string): string {
    return name
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");
}

function buildPath(
    language: string,
    category: string,
    algorithmName: string
): string {

    const extension = getExtension(language);
    let fileName = algorithmName;

    if (language === "java") {
        fileName = toPascalCase(algorithmName);
    }

    return new URL(
        `../../${language}/${category}/${fileName}.${extension}`,
        window.location.href
    ).href;
}

function getExtension(language: string): string {

    const extensions: Record<string, string> = {
        python: "py",
        cpp: "cpp",
        java: "java",
        c: "c"
    };

    return extensions[language] ?? language;
}

function injectHeaderIntoMoreInfo(header: string, selector: string) {

    const moreInfo = document.querySelector(selector) as HTMLElement | null;

    if (!moreInfo) return;

    if (!header) {
        moreInfo.innerHTML = "";
        return;
    }

    const cleaned = header
        .replace(/\/\*|\*\//g, "")
        .replace(/"""/g, "")
        .replace(/^\s*\*\s?/gm, "")
        .trim();

    moreInfo.innerHTML = formatHeaderContent(cleaned);

    if ("MathJax" in window) {
        const mathJax = (window as Window & {
            MathJax?: { typesetPromise?: (elements?: Element[]) => Promise<void> }
        }).MathJax;

        void mathJax?.typesetPromise?.([moreInfo]);
    }
}

function formatHeaderContent(text: string): string {
    const lines = text
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);

    const html: string[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        if (line.endsWith(":")) {
            const items: string[] = [];
            let j = i + 1;

            while (j < lines.length && lines[j].startsWith("- ")) {
                items.push(`<li>${formatMath(lines[j].slice(2))}</li>`);
                j++;
            }

            if (items.length > 0) {
                html.push(`<h3>${escapeHTML(line.slice(0, -1))}</h3>`);
                html.push(`<ul>${items.join("")}</ul>`);
                i = j;
                continue;
            }
        }

        html.push(`<p>${formatMath(line)}</p>`);
        i++;
    }

    return html.join("");
}

function formatMath(text: string): string {
    const escaped = escapeHTML(text);

    return escaped
        .replace(/O\(([^)]+)\)/g, (_, expr: string) => `\\(O(${expr})\\)`);
}

export function highlightCode(code: string, language: string): string {

    const keywords = new Set([
        "for","while","if","else","return",
        "def","class","public","private",
        "static","import","from","include",
        "using","void","new","try","catch"
    ]);

    const types = new Set([
        "int","float","double","char",
        "bool","String","vector",
        "List","ArrayList"
    ]);

    const lines = code.split("\n");

    return lines.map(line => {

        let result = "";
        let i = 0;

        while (i < line.length) {

            if (line[i] === '"' || line[i] === "'") {
                const quote = line[i];
                let j = i + 1;

                while (j < line.length) {
                    if (line[j] === "\\" && j + 1 < line.length) {
                        j += 2;
                        continue;
                    }
                    if (line[j] === quote) break;
                    j++;
                }

                const str = line.slice(i, j + 1);
                result += `<span class="code-string">${escapeHTML(str)}</span>`;
                i = j + 1;
                continue;
            }

            if (language === "python" && line.slice(i).startsWith("#")) {
                const comment = line.slice(i);
                result += `<span class="code-comment">${escapeHTML(comment)}</span>`;
                break;
            }

            if (language !== "python" && line.slice(i).startsWith("//")) {
                const comment = line.slice(i);
                result += `<span class="code-comment">${escapeHTML(comment)}</span>`;
                break;
            }

            if (/[a-zA-Z_]/.test(line[i])) {
                let j = i;
                while (j < line.length && /[a-zA-Z0-9_]/.test(line[j])) j++;
                const word = line.slice(i, j);

                if (keywords.has(word)) {
                    result += `<span class="code-keyword">${word}</span>`;
                } else if (types.has(word)) {
                    result += `<span class="code-type">${word}</span>`;
                } else if (line[j] === "(") {
                    result += `<span class="code-function">${word}</span>`;
                } else {
                    result += `<span class="code-variable">${word}</span>`;
                }

                i = j;
                continue;
            }

            if (/\d/.test(line[i])) {
                let j = i;
                while (j < line.length && /\d/.test(line[j])) j++;
                const num = line.slice(i, j);
                result += `<span class="code-number">${num}</span>`;
                i = j;
                continue;
            }

            result += escapeHTML(line[i]);
            i++;
        }

        return result;

    }).join("\n");
}

function escapeHTML(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function initCopyButton(root: HTMLElement) {

    const copyBtn = root.querySelector(".copy-code-btn") as HTMLButtonElement | null;
    const codeDisplay = root.querySelector(".code-display-target") as HTMLElement | null;

    if (!copyBtn || !codeDisplay) return;

    copyBtn.addEventListener("click", async () => {
        
        const text = codeDisplay.innerText || codeDisplay.textContent || "";

        await copyText(text);
        showCopySuccess(copyBtn);
    });
}