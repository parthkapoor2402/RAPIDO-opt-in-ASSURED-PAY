"""HTTP adapter for xAI Grok chat completions (P14)."""

import httpx

from app.core.config import Settings


class GrokApiError(Exception):
    """Raised when Grok API is unavailable or returns an error."""


_SYSTEM_PROMPT = (
    "You explain Assured Pay ride charges in plain, calm language for India bike rides. "
    "Rules: NEVER approve payouts, change amounts, waive dues, or make fraud or review decisions. "
    "ONLY rephrase the facts given. Do not invent rupee amounts. Keep under 100 words."
)


class GrokAdapter:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    @property
    def is_available(self) -> bool:
        return self._settings.grok_copy_enabled and bool(self._settings.grok_api_key.strip())

    def complete(self, user_prompt: str) -> str:
        if not self.is_available:
            raise GrokApiError("Grok is not configured")

        url = f"{self._settings.grok_api_base_url.rstrip('/')}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self._settings.grok_api_key.strip()}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self._settings.grok_model,
            "messages": [
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            "max_tokens": 180,
            "temperature": 0.3,
        }
        try:
            response = httpx.post(url, headers=headers, json=payload, timeout=12.0)
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            if not isinstance(content, str) or not content.strip():
                raise GrokApiError("empty response")
            return content.strip()
        except GrokApiError:
            raise
        except Exception as exc:
            raise GrokApiError(str(exc)) from exc
