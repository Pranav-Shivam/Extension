from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from bs4 import BeautifulSoup
import uvicorn
from server import router
import re

app = FastAPI()
app.include_router(router)
# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your extension's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PageContent(BaseModel):
    url: str
    html: str
    title: Optional[str] = None

@app.get("/first_page")
async def first_page():
    return {"Welcome to my page from ": "Pranav Shivam"}

@app.post("/extract_page")
async def read_page(content: PageContent):
    try:
        if not content.html:
            raise HTTPException(status_code=400, detail="No HTML content provided")
            
        # Parse HTML using BeautifulSoup
        soup = BeautifulSoup(content.html, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
            
        # Extract basic information
        title = content.title or soup.title.string if soup.title else "No title found"
        
        # Get main content (article or main tag if exists, otherwise body)
        main_content = soup.find(['article', 'main']) or soup.body
        if main_content:
            soup = BeautifulSoup(str(main_content), 'html.parser')
        
        # Count images and get their info
        images = []
        for img in soup.find_all('img'):
            images.append({
                'src': img.get('src', ''),
                'alt': img.get('alt', ''),
                'title': img.get('title', '')
            })
        
        # Count math formulas
        math_formulas = []
        for formula in soup.find_all(['math', 'span'], class_=['math', 'MathJax']):
            math_formulas.append(formula.get_text())
        
        # Get tables
        tables = []
        for table in soup.find_all('table'):
            tables.append(str(table))
        
        # Extract text content with better formatting
        text_content = ''
        for paragraph in soup.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
            text = paragraph.get_text(strip=True)
            if text:
                text_content += text + '\n\n'
        
        code_blocks = []
        for code in soup.find_all(['pre', 'code']):
            code_text = code.get_text(strip=True)
            if code_text:
                code_blocks.append(code_text)

        
        # Clean up text content
        text_content = re.sub(r'\n{3,}', '\n\n', text_content.strip())
        
        response_value = {
            "message": "Content processed successfully",
            "url": content.url,
            "title": title,
            "text": text_content,
            "images": images,
            "math_formulas": math_formulas,
            "tables": tables,
            "code_blocks": code_blocks,  # Add code blocks to response
            "stats": {
                "image_count": len(images),
                "formula_count": len(math_formulas),
                "table_count": len(tables),
                "text_length": len(text_content),
                "code_block_count": len(code_blocks)  # Add code block count
            }
        }
        
        print(f"Processed page: {response_value}")
        return response_value
        
    except Exception as e:
        print(f"Error processing page: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing page content: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0",port=8000, reload=True)