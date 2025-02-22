import time
import asyncio
from fastapi import FastAPI
from transformers import BartForConditionalGeneration, BartTokenizer
import torch
import uvicorn
from pydantic import BaseModel


app = FastAPI()

# Global model variables
model = None
tokenizer = None
last_request_time = None
unload_timeout = 300  # 5 minutes (300 seconds)


def load_model():
    """Loads the model if not already loaded."""
    global model, tokenizer
    if model is None or tokenizer is None:
        print("Loading model...")
        model_name = "facebook/bart-large-cnn"
        tokenizer = BartTokenizer.from_pretrained(model_name)
        model = BartForConditionalGeneration.from_pretrained(model_name)

        # Move model to GPU if available
        if torch.cuda.is_available():
            model.to("cuda")
            print("Model moved to GPU")
        else:
            print("Using CPU")
    else:
        print("Model already loaded.")


def unload_model():
    """Unloads the model to free memory."""
    global model, tokenizer
    if model is not None:
        print("Unloading model due to inactivity...")
        del model
        del tokenizer
        torch.cuda.empty_cache()  # Free GPU memory if needed
        model = None
        tokenizer = None


async def monitor_inactivity():
    """Background task to check if model should be unloaded."""
    global last_request_time
    while True:
        await asyncio.sleep(60)  # Check every minute
        if last_request_time and (time.time() - last_request_time) > unload_timeout:
            unload_model()
            last_request_time = None  # Reset timer


@app.on_event("startup")
async def startup_event():
    """Start background monitoring task."""
    asyncio.create_task(monitor_inactivity())


class SummarizeRequest(BaseModel):
    text: str

@app.post("/summarize/")
async def summarize(req: SummarizeRequest):
    """Summarize input text using BART model."""
    global last_request_time
    load_model()
    last_request_time = time.time()

    device = model.device  # Get model device
    inputs = tokenizer(req.text, return_tensors="pt").to(device)  # Move input to correct device

    summary_ids = model.generate(
        **inputs, max_length=100, min_length=20, length_penalty=1.0, no_repeat_ngram_size=3, early_stopping=True
    )

    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    return {"summary": summary}


uvicorn.run(app,port=2345)