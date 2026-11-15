from typing import List, Optional, Dict
from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str = "1.0.0"

class PredictRequest(BaseModel):
    landmarks: List[float] = Field(
        ...,
        description="Flattened list of coordinates [x0, y0, z0, x1, y1, z1, ... x20, y20, z20] totaling 63 floats (or 42 for 2D)."
    )
    language: Optional[str] = Field("ISL", description="Sign language dialect, defaults to ISL")

class PredictResponse(BaseModel):
    label: str
    confidence: float
    supported: bool
    is_unknown: bool = False
    details: Optional[str] = None
    all_probabilities: Optional[Dict[str, float]] = None

class SignItem(BaseModel):
    id: str
    label: str
    name: str
    description: str
    gesture_hint: str
    category: str

class SignsResponse(BaseModel):
    signs: List[SignItem]
    count: int

class AssistantRephraseRequest(BaseModel):
    text: str
    context: Optional[str] = None
    mode: Optional[str] = "polite"

class AssistantRephraseResponse(BaseModel):
    original: str
    rephrased: str
    suggestions: List[str]
    source: str
