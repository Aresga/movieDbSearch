from transformers import pipeline
import logging

logger = logging.getLogger(__name__)

class SentimentService:
    def __init__(self):
        logger.info("Loading sentiment model...")
        self.analyzer = pipeline(
            "text-classification",
            model="boltuix/NeuroFeel",
        )
        logger.info("Sentiment model loaded.")

    def analyze(self, text: str) -> dict:
        result = self.analyzer(text[:512])[0]
        label = result["label"].lower()
        score = round(result["score"], 4)

        if score < 0.40:
            label = "neutral"

        return {"label": label, "score": score}