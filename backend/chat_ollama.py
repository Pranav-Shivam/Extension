from langchain_community.chat_models import ChatOllama as LangChainChatOllama
from langchain_core.messages import HumanMessage

class ChatOllama:
    def __init__(self, model="llama2"):
        self.model = LangChainChatOllama(
            model=model,
            base_url="http://localhost:11434",  # Default Ollama server URL
            temperature=0.7
        )

    def invoke(self, question: str) -> HumanMessage:
        """
        Process a question and return an answer using the Ollama model
        """
        try:
            messages = [HumanMessage(content=question)]
            response = self.model.invoke(messages)
            return response
        except Exception as e:
            print(f"Error in ChatOllama invoke: {str(e)}")
            raise e 