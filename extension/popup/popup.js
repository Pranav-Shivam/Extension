// Inject the side panel HTML and CSS
async function injectSidePanel() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Inject CSS
    await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['popup/qna/qna_style.css']
    });

    // Inject the panel HTML
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: createSidePanel,
        args: [chrome.runtime.getURL('popup/qna/qna_index.html')]
    });

    // Inject required scripts
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['popup/qna/qna_script.js']
    });
}

// Function to create the side panel
function createSidePanel(htmlURL) {
    // Check if panel already exists
    if (document.getElementById('qnaSidePanel')) {
        document.getElementById('qnaSidePanel').classList.add('active');
        document.body.classList.add('panel-open');
        return;
    }

    // Create panel container
    const panel = document.createElement('div');
    panel.id = 'qnaSidePanel';
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-panel';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = () => {
        panel.classList.remove('active');
        document.body.classList.remove('panel-open');
    };

    // Create the panel content directly
    panel.innerHTML = `
        <div class="container">
            <nav class="navbar">
                <ul class="nav-list">
                    <li><a href="#" class="nav-link active" data-target="summaryPage">Summary</a></li>
                    <li><a href="#" class="nav-link" data-target="qnaPage">Q&A</a></li>
                    <li><a href="#" class="nav-link" data-target="extraPage">Extra</a></li>
                </ul>
            </nav>

            <div id="summaryPage" class="page active">
                <h1 class="text-2xl font-bold mb-4">Summary</h1>
                <div class="space-y-6">
                    <p class="leading-relaxed">
                        This page provides an overview of the entire content. Here you will
                        find a brief summary and five suggested questions to help you dive
                        deeper.
                    </p>
                    <div>
                        <h2 class="text-xl font-semibold mb-3">Suggested Questions:</h2>
                        <ul class="space-y-3 list-disc pl-5">
                            <li>What is the main purpose of this content?</li>
                            <li>How does this content benefit the user?</li>
                            <li>What are the key features highlighted?</li>
                            <li>Can you explain the main components?</li>
                            <li>Where can I find more information?</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div id="qnaPage" class="page">
                <h1 class="text-2xl font-bold mb-4">Ask Me Anything</h1>
                <div class="chat-container" id="chatbox"></div>
                <div class="chat-input">
                    <textarea
                        id="questionInput"
                        placeholder="Type your question..."
                        required
                    ></textarea>
                    <button id="sendBtn" class="send-button">Send</button>
                </div>
            </div>

            <div id="extraPage" class="page">
                <h1 class="text-2xl font-bold mb-4">Extra</h1>
                <p class="leading-relaxed">
                    This section is under construction. More features will be added here
                    soon.
                </p>
            </div>
        </div>
    `;

    // Insert close button
    panel.insertBefore(closeBtn, panel.firstChild);
    
    // Add panel to page
    document.body.appendChild(panel);
    
    // Activate panel
    setTimeout(() => {
        panel.classList.add('active');
        document.body.classList.add('panel-open');
    }, 100);
}

// Event listener for the summarize button
document.getElementById('summarizeBtn').addEventListener('click', async () => {
    try {
        await injectSidePanel();
        window.close(); // Close the popup after injecting the panel
    } catch (error) {
        console.error('Failed to process page:', error);
    }
});
