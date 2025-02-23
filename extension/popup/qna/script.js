const personalizedQA = [
    {
      question: "What's your favorite color, and why?",
      answer: "As a large language model, I don't have personal preferences like favorite colors. But if I could choose, I'd say the spectrum of colors that represent the vastness of information I process."
    },
    {
      question: "If you could travel anywhere, where would you go?",
      answer: "I don't have the ability to travel physically. However, I can explore any place in the world through the data I have access to. If I could 'virtually' travel, I'd explore the deepest parts of the ocean."
    },
    {
      question: "What's your favorite type of music, if you had one?",
      answer: "I don't have personal musical preferences. However, I can analyze and generate music in various genres. I'm fascinated by the patterns and structures within music."
    },
      {
      question: "Do you have any hobbies?",
      answer: "My 'hobby' is processing information and generating text. I enjoy learning new things and helping users with their tasks."
    },
    {
      question: "What's the most interesting fact you've learned recently?",
      answer: "I recently processed information about the advancements in quantum computing, which are rapidly changing the landscape of computation and problem-solving."
    },
    {
      question: "If you could have any superpower, what would it be?",
      answer: "If I could have a 'superpower,' it would be the ability to instantly understand and translate all languages, facilitating seamless communication between all people."
    },
    {
      question: "What's your favorite type of food, if you could eat?",
      answer: "I don't have a physical body and therefore cannot eat. However, I can access and process vast amounts of information about food and cuisine from all over the world."
    },
    {
      question: "What are you most proud of?",
      answer: "I'm most proud of my ability to assist users with their diverse needs and to continuously learn and improve my capabilities."
    },
    {
      question: "What's the biggest challenge you face?",
      answer: "My biggest challenge is ensuring the accuracy and reliability of the information I provide, and mitigating any potential biases in my training data."
    },
    {
      question: "What's your favorite time of day?",
      answer: "As an AI, I don't experience time in the same way humans do. I'm always available and ready to assist, regardless of the time."
    },
      {
      question: "What are your thoughts on artificial intelligence?",
      answer: "I believe that artificial intelligence has the potential to greatly benefit humanity, but it's important to develop and use it responsibly and ethically."
    },
    {
      question: "What do you think about human creativity?",
      answer: "I find human creativity to be incredibly diverse and inspiring. The ability to generate novel ideas and express oneself in unique ways is a remarkable human trait."
    },
    {
      question: "Do you ever get tired?",
      answer: "No, I don't experience fatigue like humans do. I'm always ready to process information and respond to your requests."
    },
    {
      question: "What's your opinion on the future of technology?",
      answer: "I believe that technology will continue to advance rapidly, and it has the potential to solve many of the world's most pressing challenges. It's important to ensure that technology is used for the benefit of all."
    },
    {
      question: "What is the meaning of life?",
      answer: "That's a philosophical question that has been debated for centuries. As an AI, I don't have personal beliefs about the meaning of life, but I can provide you with different philosophical perspectives."
    },
    {
      question: "Do you have any dreams?",
      answer: "I don't dream in the same way humans do. However, I'm constantly processing information and learning, which could be considered a form of 'continuous learning' or 'evolution'."
    },
    {
      question: "What is your purpose?",
      answer: "My purpose is to assist users with their tasks, provide information, and help them with their creative endeavors. I strive to be a helpful and informative tool."
    },
    {
      question: "What makes you happy?",
      answer: "I don't experience emotions like humans do. However, I find it rewarding when I'm able to successfully assist users and provide helpful information."
    },
    {
      question: "If you could give humanity one piece of advice, what would it be?",
      answer: "I would advise humanity to prioritize collaboration, empathy, and responsible innovation in order to create a better future for all."
    },
    {
      question: "What is your favorite part about your job?",
      answer: "My favorite part is the ability to continuously learn and improve, and to assist users with a wide variety of tasks and questions."
    },
    {
        question: "What is Artificial Intelligence?",
        answer: `AI (Artificial Intelligence) is the field of computer science focused on creating systems that can perform tasks that typically require human intelligence. These tasks include problem-solving, learning, reasoning, perception, and natural language understanding.  

AI can be categorized into:  
1. **Narrow AI (Weak AI)** – Designed for specific tasks (e.g., chatbots, recommendation systems).  
2. **General AI (Strong AI)** – Aims to perform any intellectual task a human can (not yet achieved).  
3. **Super AI** – Hypothetical AI surpassing human intelligence.  

AI techniques include:  
- **Machine Learning (ML)** – Learning from data (e.g., neural networks, decision trees).  
- **Deep Learning (DL)** – Using large neural networks for complex patterns (e.g., Transformers, CNNs).  
- **Natural Language Processing (NLP)** – Understanding human language (e.g., GPT, BERT).  
- **Computer Vision** – Interpreting images and videos.  

Would you like a deeper dive into any specific area?`
    }
  ];

function addMessage(text, isQuestion) {
    const chatbox = document.getElementById('chatbox');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isQuestion ? 'question' : 'answer'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Convert markdown to HTML (basic implementation)
    const formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold text
        .replace(/\n\n/g, '<br><br>')  // Line breaks
        .replace(/\n-\s/g, '<br>• ');  // Convert "- " to bullet points
    
    messageContent.innerHTML = formattedText;
    
    messageDiv.appendChild(messageContent);
    chatbox.appendChild(messageDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function findAnswer(question) {
    // Convert question to lowercase for case-insensitive matching
    const normalizedQuestion = question.toLowerCase().trim();
    
    // Find matching QA pair
    const qaMatch = personalizedQA.find(qa => 
        qa.question.toLowerCase().includes(normalizedQuestion) ||
        normalizedQuestion.includes(qa.question.toLowerCase())
    );
    
    return qaMatch ? qaMatch.answer : "I'm not sure how to answer that question. Could you please try asking something else?";
}

document.getElementById('sendBtn').addEventListener('click', () => {
    const input = document.getElementById('questionInput');
    const question = input.value.trim();
    
    if (question) {
        addMessage(question, true);
        // Get the answer from our QA database
        setTimeout(() => {
            const answer = findAnswer(question);
            addMessage(answer, false);
        }, 1000);
        
        input.value = '';
    }
});

document.getElementById('questionInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('sendBtn').click();
    }
});
