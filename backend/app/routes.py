from fastapi import APIRouter, HTTPException, status
import httpx
from typing import List
from .schemas import (
    HealthResponse,
    PredictRequest,
    PredictResponse,
    SignsResponse,
    SignItem,
    AssistantRephraseRequest,
    AssistantRephraseResponse
)
from .predictor import predictor_instance, SUPPORTED_SIGNS_METADATA

router = APIRouter(prefix="/api")

OLLAMA_API_URL = "http://127.0.0.1:11434/api/generate"
OLLAMA_MODEL = "gemma:2b"

@router.get("/health", response_model=HealthResponse, tags=["System"])
def get_health():
    """Health check endpoint to verify backend service status."""
    return HealthResponse(
        status="healthy",
        service="SignaLink API",
        version="1.0.0"
    )

@router.get("/signs", response_model=SignsResponse, tags=["Gestures"])
def get_supported_signs():
    """Retrieve catalog of supported Indian Sign Language signs."""
    sign_items = [SignItem(**item) for item in SUPPORTED_SIGNS_METADATA]
    return SignsResponse(signs=sign_items, count=len(sign_items))

@router.post("/predict", response_model=PredictResponse, tags=["Gestures"])
def predict_gesture(request: PredictRequest):
    """
    Classify normalized hand landmarks into a supported sign or flag as unknown.
    Expects 63 floats (21 landmarks x 3 spatial coordinates) or 42 floats.
    """
    if len(request.landmarks) not in (42, 63):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Expected 63 (3D) or 42 (2D) landmark coordinates, received {len(request.landmarks)}."
        )

    try:
        result = predictor_instance.predict(request.landmarks)
        return PredictResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction error: {str(e)}"
        )

@router.post("/assistant/rephrase", response_model=AssistantRephraseResponse, tags=["AI Assistant"])
async def rephrase_text(request: AssistantRephraseRequest):
    """
    Rephrase sign-language transcript into natural polite sentences or offer response suggestions.
    Uses local Ollama with Gemma if running, otherwise falls back gracefully.
    """
    raw_text = request.text.strip()
    if not raw_text:
        return AssistantRephraseResponse(
            original="",
            rephrased="",
            suggestions=[],
            source="empty"
        )

    # Attempt query to local Ollama runtime
    ollama_success = False
    rephrased_output = ""
    try:
        prompt = (
            f"You are SignaLink AI Assistant. Convert this recognized sign language sequence into a complete, "
            f"natural, polite sentence for communication:\n\n"
            f"Sign words: '{raw_text}'\n\n"
            f"Provide only the polished natural sentence, keeping the original meaning intact."
        )
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.post(
                OLLAMA_API_URL,
                json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False}
            )
            if resp.status_code == 200:
                data = resp.json()
                rephrased_output = data.get("response", "").strip()
                if rephrased_output:
                    ollama_success = True
    except Exception:
        # Ollama not running or timeout; use smart linguistic fallback
        pass

    if not ollama_success:
        # Context-aware deterministic rule-based assistant fallback
        words = raw_text.upper().split()
        natural_map = {
            "HELLO": "Hello, it is nice to meet you.",
            "THANK_YOU": "Thank you very much.",
            "YES": "Yes, I agree.",
            "NO": "No, thank you.",
            "PLEASE": "Please help me.",
            "GOOD": "That sounds very good.",
            "BAD": "I do not think that is good.",
            "PEACE": "Wishing you peace and success.",
            "HELP": "I need assistance, please.",
            "I_LOVE_YOU": "Sending you warmth and love."
        }

        # Build compound sentence from recognized tokens
        parts = []
        for w in words:
            clean_w = w.strip(",.!?")
            if clean_w in natural_map:
                parts.append(natural_map[clean_w])
            else:
                parts.append(clean_w.capitalize())

        rephrased_output = " ".join(parts) if parts else raw_text.capitalize() + "."
        source = "Local Rule-Based Assistant (Ollama Offline)"
    else:
        source = f"Ollama ({OLLAMA_MODEL})"

    # Smart response suggestions for the conversation partner
    suggestions = [
        "I understand, thank you!",
        "Could you please repeat that sign?",
        "How can I help you today?",
        "Glad to communicate with you."
    ]

    return AssistantRephraseResponse(
        original=raw_text,
        rephrased=rephrased_output,
        suggestions=suggestions,
        source=source
    )
