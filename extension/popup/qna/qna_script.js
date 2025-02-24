// Create a namespace for our QNA functionality
window.QNA = window.QNA || {
    initialized: false,
    isSending: false
};

// Only initialize once
if (!window.QNA.initialized) {
    window.QNA.initialized = true;

    // Message handling functions
    function addMessage(text, isQuestion) {
        const chatbox = document.getElementById('chatbox');
        if (!chatbox) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isQuestion ? 'question' : 'answer'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n-\s/g, '<br>• ');
        
        messageDiv.appendChild(messageContent);
        chatbox.appendChild(messageDiv);
        chatbox.scrollTop = chatbox.scrollHeight;
    }

    // API interaction
    async function getAnswer(question) {
        try {
            const response = await fetch('http://localhost:8000/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: question, "model_id": "qna"})
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            return data.result;
        } catch (error) {
            console.error('Error fetching answer:', error);
            return "Sorry, I encountered an error while processing your question. Please try again.";
        }
    }

    // Utility function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    // Initialize all event listeners when DOM is loaded
    function initializeEventListeners() {
        const debouncedSend = debounce(async () => {
            const questionInput = document.getElementById('questionInput');
            if (!questionInput) return;
            
            const question = questionInput.value.trim();
            if (!question || window.QNA.isSending) return;
            
            try {
                window.QNA.isSending = true;
                addMessage(question, true);
                
                questionInput.value = '';
                questionInput.style.height = 'auto';
                
                const loadingDiv = document.createElement('div');
                loadingDiv.className = 'message answer loading';
                loadingDiv.textContent = 'Thinking...';
                document.getElementById('chatbox')?.appendChild(loadingDiv);
                
                const answer = await getAnswer(question);
                loadingDiv?.remove();
                addMessage(answer, false);
            } catch (error) {
                console.error('Error:', error);
                loadingDiv?.remove();
                addMessage("Sorry, I encountered an error. Please try again.", false);
            } finally {
                window.QNA.isSending = false;
            }
        }, 300);

        // Chat input handlers
        const sendBtn = document.getElementById('sendBtn');
        const questionInput = document.getElementById('questionInput');
        
        if (sendBtn && questionInput) {
            sendBtn.addEventListener('click', debouncedSend);
            
            questionInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    debouncedSend();
                }
            });
            
            questionInput.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 120) + 'px';
            });
        }
        
        // Tab navigation
        const navLinks = document.querySelectorAll('nav a');
        const pages = document.querySelectorAll('.page');
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                navLinks.forEach(nav => nav.classList.remove('active'));
                pages.forEach(page => page.classList.remove('active'));
                this.classList.add('active');
                const targetPage = document.getElementById(this.getAttribute('data-target'));
                if (targetPage) targetPage.classList.add('active');
            });
        });

        // Question editing functionality
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const questionBlock = e.target.closest('.question-block');
                if (!questionBlock) return;

                const textElement = questionBlock.querySelector('.question-text');
                const inputElement = questionBlock.querySelector('.question-input');
                const editButton = questionBlock.querySelector('.edit-button');

                if (questionBlock.classList.contains('editing')) {
                    textElement.textContent = inputElement.value;
                    editButton.innerHTML = '✎';
                    questionBlock.classList.remove('editing');
                } else {
                    inputElement.value = textElement.textContent;
                    editButton.innerHTML = '✓';
                    questionBlock.classList.add('editing');
                    inputElement.focus();
                }
            });
        });
    }

    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeEventListeners);
    } else {
        initializeEventListeners();
    }
}