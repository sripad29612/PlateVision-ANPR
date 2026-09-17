import os
import sys

# Ensure ai-engine directory is in sys.path
AI_ENGINE_DIR = os.path.dirname(os.path.abspath(__file__))
if AI_ENGINE_DIR not in sys.path:
    sys.path.insert(0, AI_ENGINE_DIR)

def get_registered_routes(app):
    routes = []
    seen = set()

    def inspect_route_list(route_list, prefix=""):
        for r in route_list:
            if hasattr(r, "path"):
                methods = sorted(list(getattr(r, "methods", [])))
                path = prefix + r.path
                key = (path, tuple(methods))
                if key not in seen:
                    seen.add(key)
                    routes.append((path, methods))
            elif hasattr(r, "original_router"):
                sub_router = r.original_router
                sub_routes = getattr(sub_router, "routes", [])
                sub_prefix = getattr(r, "prefix", "")
                inspect_route_list(sub_routes, prefix + sub_prefix)
            elif hasattr(r, "router"):
                sub_router = r.router
                sub_routes = getattr(sub_router, "routes", [])
                sub_prefix = getattr(r, "prefix", "")
                inspect_route_list(sub_routes, prefix + sub_prefix)
            elif hasattr(r, "routes"):
                sub_prefix = getattr(r, "prefix", "")
                inspect_route_list(r.routes, prefix + sub_prefix)

    inspect_route_list(app.routes)
    return routes

def verify():
    print("==================================================")
    print("        PRODUCTION SETUP VERIFICATION")
    print("==================================================")

    # 1. Requirements Check
    print("\n--- 1. Requirements Check ---")
    req_file = os.path.join(AI_ENGINE_DIR, "requirements.txt")
    with open(req_file, "r", encoding="utf-8") as f:
        reqs = [line.strip() for line in f if line.strip()]
    print("Configured requirements.txt packages:")
    for p in reqs:
        print(f"  - {p}")
    assert "pymongo" in reqs, "pymongo missing from requirements.txt"
    assert "opencv-python-headless" in reqs, "opencv-python-headless missing from requirements.txt"
    assert "opencv-python" not in reqs, "opencv-python should not be present (must be headless)"
    print("RESULT: Requirements check PASSED.")

    # 2. Model File Check
    print("\n--- 2. Model File Check ---")
    model_file = os.path.join(AI_ENGINE_DIR, "models", "best.pt")
    assert os.path.exists(model_file), f"Model file not found at {model_file}"
    size = os.path.getsize(model_file)
    print(f"Target model file: {model_file}")
    print(f"File size: {size} bytes ({size / (1024*1024):.2f} MB)")
    assert size == 6250602, f"Expected size 6250602 bytes, got {size}"
    print("RESULT: Model file check PASSED.")

    # 3. MODEL_PATH Resolution
    print("\n--- 3. MODEL_PATH Resolution ---")
    from app.api.detect import MODEL_PATH
    print(f"Resolved MODEL_PATH: {MODEL_PATH}")
    assert os.path.exists(MODEL_PATH), f"Resolved MODEL_PATH does not exist: {MODEL_PATH}"
    assert MODEL_PATH.endswith(os.path.join("models", "best.pt")), f"MODEL_PATH does not point to models/best.pt: {MODEL_PATH}"
    print("RESULT: MODEL_PATH resolution PASSED.")

    # 4. YOLO Model Loading
    print("\n--- 4. YOLO Model Loading ---")
    from app.api.detect import model
    print(f"Loaded YOLO Model Type: {type(model)}")
    print(f"Loaded Model Task: {getattr(model, 'task', 'detect')}")
    print("RESULT: YOLO model loading PASSED.")

    # 5. FastAPI App Loading
    print("\n--- 5. FastAPI App Loading ---")
    from app.main import app
    print(f"FastAPI app instance: {app}")
    print(f"FastAPI app title: {app.title}")
    print("RESULT: FastAPI app loading PASSED.")

    # 6. Registered Routes
    print("\n--- 6. Registered Routes ---")
    routes = get_registered_routes(app)
    print(f"Total endpoints registered: {len(routes)}")
    for path, methods in routes:
        method_str = ", ".join(methods) if methods else "ANY"
        print(f"  [{method_str:10}] {path}")

    # Verify expected endpoints
    registered_paths = [path for path, _ in routes]
    expected = [
        "/detect",
        "/login",
        "/history",
        "/dashboard",
        "/graph-data",
        "/delete/{id}",
        "/delete-history",
    ]
    print("\nVerifying expected application endpoints:")
    for ep in expected:
        found = any(p == ep or (ep.startswith("/delete/{") and p.startswith("/delete/{")) for p in registered_paths)
        status = "CONFIRMED" if found else "NOT FOUND"
        print(f"  {ep:<20} -> {status}")
        assert found, f"Expected endpoint {ep} was not found in registered routes!"

    print("\n==================================================")
    print("       ALL 6 VERIFICATION CHECKS PASSED")
    print("==================================================")

if __name__ == "__main__":
    verify()
