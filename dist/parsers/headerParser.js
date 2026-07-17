export function extractHeaderComment(code, language) {
    let match = null;
    if (language === "python") {
        match = code.match(/^\s*("""[\s\S]*>""")\s*/);
    }
    else {
        match = code.match(/^\s*(\/\*[\s\S]*?\*\/)\s*/);
    }
    if (!match) {
        return { header: "", body: code };
    }
    return {
        header: match[1],
        body: code.slice(match[0].length)
    };
}
