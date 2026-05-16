"""Agent runner.

B3-hardened version: prompt caching on the static ACMG/AMP reference block
(cache_control ephemeral) plus dual retry — exponential-backoff for transient
HTTP errors (429/529/503/connection) and a one-shot JSON cleanup turn when
the model returns non-JSON.
"""
import json
import os
import random
import re
import time

import anthropic
from anthropic import Anthropic

from modal_app import (
    DEFAULT_MODEL,
    VOLUME_MOUNT,
    anthropic_secret,
    app,
    image,
    volume,
)
from functions.agents.prompts import AGENT_PROMPTS

_FENCE_RE = re.compile(r"^```(?:json)?\s*|\s*```$", flags=re.MULTILINE)
_HTTP_MAX_ATTEMPTS = 3
_HTTP_BASE_DELAY = 2.0
_HTTP_FACTOR = 2.0


def _is_transient(exc: BaseException) -> bool:
    """Return True for errors worth retrying."""
    if isinstance(exc, (anthropic.RateLimitError, anthropic.APIConnectionError)):
        return True
    if isinstance(exc, anthropic.APIStatusError):
        return getattr(exc, "status_code", None) in (500, 502, 503, 504, 529)
    return False


def _create_with_retry(client: Anthropic, **kwargs):
    """Call messages.create with exponential backoff on transient failures."""
    last_exc = None
    for attempt in range(_HTTP_MAX_ATTEMPTS):
        try:
            return client.messages.create(**kwargs)
        except Exception as exc:  # noqa: BLE001
            if not _is_transient(exc):
                raise
            last_exc = exc
            if attempt == _HTTP_MAX_ATTEMPTS - 1:
                break
            delay = _HTTP_BASE_DELAY * (_HTTP_FACTOR ** attempt) * random.uniform(0.7, 1.3)
            time.sleep(delay)
    raise last_exc  # type: ignore[misc]


def _strip_fences(text: str) -> str:
    return _FENCE_RE.sub("", text.strip()).strip()


def _usage_dict(usage) -> dict:
    return {
        "input_tokens": usage.input_tokens,
        "output_tokens": usage.output_tokens,
        "cache_read_input_tokens": getattr(usage, "cache_read_input_tokens", 0),
        "cache_creation_input_tokens": getattr(usage, "cache_creation_input_tokens", 0),
    }


@app.function(
    image=image,
    volumes={VOLUME_MOUNT: volume},
    secrets=[anthropic_secret],
    timeout=120,
)
def run_agent(challenge: dict, agent_name: str) -> dict:
    """Run one agent against one challenge dict.

    Returns the parsed JSON prediction plus `_model` and `_usage` metadata.
    """
    client = Anthropic()
    system_prompt = AGENT_PROMPTS[agent_name]
    model = os.getenv("PATHOS_MODEL_OVERRIDE", DEFAULT_MODEL)

    user_msg = (
        "Classify this variant per ACMG/AMP guidelines.\n\n"
        f"VARIANT DATA:\n{json.dumps(challenge, indent=2)}\n\n"
        "Respond with valid JSON only, no markdown fences, no preamble."
    )

    system_blocks = [
        {
            "type": "text",
            "text": system_prompt,
            "cache_control": {"type": "ephemeral"},
        }
    ]
    messages = [{"role": "user", "content": user_msg}]

    response = _create_with_retry(
        client,
        model=model,
        max_tokens=2048,
        system=system_blocks,
        messages=messages,
    )

    text = _strip_fences(response.content[0].text)
    json_retry = False
    usage = response.usage

    try:
        result = json.loads(text)
    except json.JSONDecodeError as orig_exc:
        json_retry = True
        retry_messages = [
            {"role": "user", "content": user_msg},
            {"role": "assistant", "content": text},
            {
                "role": "user",
                "content": (
                    "Your previous response was not valid JSON. Return only the "
                    "JSON object, no prose, no markdown fences."
                ),
            },
        ]
        retry_response = _create_with_retry(
            client,
            model=model,
            max_tokens=2048,
            system=system_blocks,
            messages=retry_messages,
        )
        retry_text = _strip_fences(retry_response.content[0].text)
        try:
            result = json.loads(retry_text)
        except json.JSONDecodeError:
            snippet = retry_text[:200].replace("\n", " ")
            raise json.JSONDecodeError(
                f"{orig_exc.msg} (retry also failed; snippet: {snippet!r})",
                orig_exc.doc,
                orig_exc.pos,
            ) from orig_exc
        usage = retry_response.usage

    result["_model"] = model
    result["_usage"] = _usage_dict(usage)
    if json_retry:
        result["_usage"]["original_input_tokens"] = response.usage.input_tokens
        result["_usage"]["json_retry"] = True
    return result
