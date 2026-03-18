import sys
import torch
import psutil
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline, GenerationConfig

# ── 1. Environment check ─────────────────────────────────────────────────────
print("=== Environment Check ===")
print(f"Python:     {sys.version}")
print(f"PyTorch:    {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Running on: {device.upper()}\n")

# ── 2. Load model ─────────────────────────────────────────────────────────────
print("=== Loading Model ===")
model_id = "Qwen/Qwen2.5-0.5B-Instruct"

tokenizer = AutoTokenizer.from_pretrained(model_id)

model = AutoModelForCausalLM.from_pretrained(
    model_id,
    dtype=torch.float32,
    low_cpu_mem_usage=True
)
model.eval()

pipe = pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer,
    device=device
)
print("Model loaded successfully.\n")

# ── 3. Generation config ──────────────────────────────────────────────────────
generation_config = GenerationConfig(
    max_new_tokens=128,
    do_sample=False,
    repetition_penalty=1.1
)

# ── 4. RAG prompt builder ─────────────────────────────────────────────────────
def build_messages(retrieved_chunks: str, user_query: str) -> list:
    return [
        {
            "role": "system",
            "content": (
                "You are a helpful assistant. "
                "Answer the user's question using ONLY the provided context. "
                "Be concise and do not make up information."
            )
        },
        {
            "role": "user",
            "content": f"Context:\n{retrieved_chunks}\n\nQuestion: {user_query}"
        }
    ]

# ── 5. Generate answer ────────────────────────────────────────────────────────
def generate_answer(retrieved_chunks: str, user_query: str) -> str:
    messages = build_messages(retrieved_chunks, user_query)
    output = pipe(messages, generation_config=generation_config)
    return output[0]["generated_text"][-1]["content"]

# ── 6. Test ───────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    retrieved_chunks = """
    Pong is a two-player sport game simulating table tennis.
    The player controls an in-game paddle by moving it vertically
    across the left or right side of the screen.
    Players use the paddle to hit a ball back and forth.
    """

    user_query = "How do you control the paddle in Pong?"

    print("=== Generating Response ===")
    print(f"Question: {user_query}\n")

    answer = generate_answer(retrieved_chunks, user_query)
    print(f"Answer:\n{answer}")

    ram = psutil.virtual_memory()
    print(f"\n=== RAM: {ram.used / 1024**3:.2f} GB used / {ram.total / 1024**3:.2f} GB total ===")
