import time
import asyncio
from fastapi import APIRouter, HTTPException
from transformers import BartForConditionalGeneration, BartTokenizer
import torch
import uvicorn
from pydantic import BaseModel
import requests
from typing import Dict, Optional
import json
from config import *


router = APIRouter()

# Global model variables
models: Dict[str, any] = {}  # Store multiple models
tokenizers: Dict[str, any] = {}
last_request_times: Dict[str, float] = {}
unload_timeout = 300  # 5 minutes

# Model configurations
MODEL_CONFIGS = {
    "summarization": {
        "model_name": "facebook/bart-large-cnn",
        "type": "local",
        "device": "cuda" if torch.cuda.is_available() else "cpu",
    },
    "doc-qna": {
        "model_name": "impira/layoutlm-document-qa",
        "type": "remote",
        "endpoint": f"http://{REMOTE_HOST}:8000/process/",
    }
}


def load_model(model_id: str):
    """Loads the specified model if not already loaded."""
    global models, tokenizers
    
    if model_id not in MODEL_CONFIGS:
        raise HTTPException(status_code=404, detail=f"Model {model_id} not found")
    
    config = MODEL_CONFIGS[model_id]
    
    if config["type"] == "local":
        if model_id not in models or models[model_id] is None:
            print(f"Loading local model {model_id}...")
            tokenizers[model_id] = BartTokenizer.from_pretrained(config["model_name"])
            models[model_id] = BartForConditionalGeneration.from_pretrained(config["model_name"])
            
            if config["device"] == "cuda":
                models[model_id].to("cuda")
                print(f"Model {model_id} moved to GPU")
            else:
                print(f"Using CPU for model {model_id}")
        else:
            print(f"Model {model_id} already loaded.")


def unload_model(model_id: str):
    """Unloads the specified model to free memory."""
    global models, tokenizers
    
    if model_id in models and models[model_id] is not None:
        print(f"Unloading model {model_id} due to inactivity...")
        del models[model_id]
        del tokenizers[model_id]
        torch.cuda.empty_cache()
        models[model_id] = None
        tokenizers[model_id] = None


async def monitor_inactivity():
    """Background task to check if models should be unloaded."""
    global last_request_times
    while True:
        await asyncio.sleep(60)  # Check every minute
        current_time = time.time()
        for model_id, last_time in last_request_times.items():
            if last_time and (current_time - last_time) > unload_timeout:
                unload_model(model_id)
                last_request_times[model_id] = None


@router.on_event("startup")
async def startup_event():
    """Start background monitoring task."""
    asyncio.create_task(monitor_inactivity())


class ModelRequest(BaseModel):
    text: str
    model_id: str


@router.post("/process")
async def process_text(req: ModelRequest):
    """Process input text using specified model."""
    global last_request_times
    print("HERE")
    if req.model_id not in MODEL_CONFIGS:
        raise HTTPException(status_code=404, detail=f"Model {req.model_id} not found")
    
    config = MODEL_CONFIGS[req.model_id]
    

    # TODO:- If request is coming from remote, and config type of that model is also remote, then decline the request and send beautiful words :)
    if config["type"] == "remote":
        # Forward request to remote machine
        try:
            response = requests.post(
                config["endpoint"],
                json={"text": req.text, "model_id": req.model_id}
            )
            return response.json()
        except requests.exceptions.RequestException as e:
            raise HTTPException(status_code=500, detail=f"Remote model error: {str(e)}")
    
    # Handle local model
    load_model(req.model_id)
    last_request_times[req.model_id] = time.time()
    
    model = models[req.model_id]
    tokenizer = tokenizers[req.model_id]
    device = model.device
    
    inputs = tokenizer(req.text, return_tensors="pt").to(device)
    
    outputs = model.generate(
        **inputs, max_length=100, min_length=20, length_penalty=1.0, 
        no_repeat_ngram_size=3, early_stopping=True
    )
    
    result = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return {"result": result}


def get_suggested_questions():
    pass