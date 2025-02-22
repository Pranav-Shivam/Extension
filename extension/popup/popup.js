document.getElementById('summarizeBtn').addEventListener('click', async () => {
    try {
        // Get the current active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Execute the content script in the active tab
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content-script.js']
        });
    } catch (error) {
        console.error('Failed to process page:', error);
    }
});
