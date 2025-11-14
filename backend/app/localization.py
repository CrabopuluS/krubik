"""Utility helpers for translating error messages."""

from __future__ import annotations

from typing import Mapping

_SUPPORTED_LANGUAGES = ("en", "ru")

_MESSAGES: dict[str, Mapping[str, str]] = {
    "invalid_length": {
        "en": "State must contain {expected} facelets; received {received}.",
        "ru": "Строка должна содержать {expected} стикеров, получено {received}.",
    },
    "invalid_colors": {
        "en": "State contains unsupported colors: {colors}.",
        "ru": "Строка содержит недопустимые цвета: {colors}.",
    },
    "invalid_distribution": {
        "en": "Color {color} must appear {expected} times; received {received}.",
        "ru": "Цвет {color} должен встречаться {expected} раз(а); найдено {received}.",
    },
    "unsolvable": {
        "en": "The provided cube state is not solvable.",
        "ru": "Указанное состояние куба неразрешимо.",
    },
    "external_disabled": {
        "en": "External solver is disabled.",
        "ru": "Внешний сервис решения отключён.",
    },
    "external_unavailable": {
        "en": "External solver responded with an error.",
        "ru": "Внешний сервис вернул ошибку.",
    },
    "external_unreachable": {
        "en": "Failed to reach external solver. Fallback used.",
        "ru": "Не удалось связаться с внешним сервисом. Использован локальный решатель.",
    },
    "invalid_response": {
        "en": "External solver returned malformed payload.",
        "ru": "Внешний сервис вернул некорректный ответ.",
    },
    "invalid_csrf": {
        "en": "CSRF token mismatch.",
        "ru": "CSRF токен не совпадает.",
    },
    "rate_limited": {
        "en": "Rate limit exceeded. Try again later.",
        "ru": "Превышен лимит запросов. Повторите позже.",
    },
}


def resolve_language(accept_language: str | None) -> str:
    if not accept_language:
        return "en"
    candidates = [lang.strip().lower().split("-")[0] for lang in accept_language.split(",")]
    for candidate in candidates:
        if candidate in _SUPPORTED_LANGUAGES:
            return candidate
    return "en"


def translate(key: str, language: str, **context: object) -> str:
    templates = _MESSAGES.get(key)
    if not templates:
        return key
    template = templates.get(language) or templates.get("en") or key
    return template.format(**context)
