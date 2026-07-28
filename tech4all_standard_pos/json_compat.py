"""JSON helpers backed by orjson while retaining the stdlib json API shape."""

from __future__ import annotations

from typing import Any

import orjson


JSONDecodeError = orjson.JSONDecodeError


def loads(value: str | bytes | bytearray | memoryview) -> Any:
	"""Deserialize JSON from the input types accepted by Frappe request methods."""
	return orjson.loads(value)


def dumps(value: Any, **kwargs: Any) -> str:
	"""Serialize JSON to text, as ``json.dumps`` does.

	orjson returns UTF-8 bytes. Frappe DocFields and cache APIs generally expect
	text, so this adapter decodes the result before returning it. The common
	``default`` and ``sort_keys`` stdlib options are supported for callers that
	need them.
	"""
	option = kwargs.pop("option", 0)
	if kwargs.pop("sort_keys", False):
		option |= orjson.OPT_SORT_KEYS

	default = kwargs.pop("default", None)
	# Formatting-only stdlib arguments have no semantic effect.
	for name in ("ensure_ascii", "check_circular", "allow_nan", "cls", "indent", "separators"):
		kwargs.pop(name, None)
	if kwargs:
		unsupported = ", ".join(sorted(kwargs))
		raise TypeError(f"Unsupported JSON option(s): {unsupported}")

	return orjson.dumps(value, default=default, option=option).decode("utf-8")
