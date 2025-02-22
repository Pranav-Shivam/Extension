// Simplified content extraction without Readability dependency
function extractPageContent() {
    try {
        const pageContent = {
            url: window.location.href,
            html: document.documentElement.outerHTML,
            title: document.title
        };

        chrome.runtime.sendMessage({
            action: "processContent",
            content: pageContent
        });
    } catch (error) {
        console.error('Error processing page:', error);
        chrome.runtime.sendMessage({
            action: "processContent",
            error: error.message
        });
    }
}

// Run when extension is triggered
extractPageContent();