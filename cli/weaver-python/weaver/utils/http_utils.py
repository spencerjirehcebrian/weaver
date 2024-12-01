import requests
from rich.console import Console
from typing import Dict, Any

def send_chunk(chunk: str, endpoint: str) -> bool:
    try:
        response = requests.post(
            endpoint,
            json={"content": chunk},
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        return True
    except Exception as e:
        Console().print(f"[red]Error sending chunk: {e}[/red]")
        return False