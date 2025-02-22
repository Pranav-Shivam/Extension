// Context Menu Integration
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "summarizePage",
      title: "Summarize Page",
      contexts: ["page"]
    });
  });
  
  // Handle Context Menu Click
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "summarizePage") {
      try {
        // Inject only content script
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content-script.js']
        });
      } catch (error) {
        console.error('Script injection error:', error);
      }
    }
  });
  
  // Handle Messages
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "processContent") {
      console.log("Received content from page:", request.content);
      sendToBackend(request.content);
    }
  });
  
  // Send to Backend
  async function sendToBackend(content) {
    const backend_url = "http://localhost:8000/extract_page";
    try {
      console.log("Sending to backend:", content);
      const response = await fetch(backend_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      const result = await response.json();
      console.log("Backend response:", result);
      
      // Create notification with processed content stats
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/chrome-extension-icon-11.jpg',
        title: 'Page Processed',
        message: `Successfully processed: ${result.title}\nFound: ${result.stats.image_count} images, ${result.stats.formula_count} formulas`
      });
    } catch (error) {
      console.error('Error:', error);
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/chrome-extension-icon-11.jpg',
        title: 'Error',
        message: 'Failed to process page. Is the backend server running?'
      });
    }
  }