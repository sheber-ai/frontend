#!/usr/bin/env python3
"""PreToolUse-хук Claude Code: сгенерированный код не редактируется руками."""

import json
import sys

GENERATED = {
    "/src/shared/api/generated/": "Клиент API генерирует Orval: `npm run generate:api` "
                                  "(бэкенд запущен или OPENAPI_URL=../backend/openapi.json). "
                                  "Нужен другой контракт — меняйте эндпоинт/схему на бэкенде.",
    "/src/routeTree.gen.ts": "Дерево роутов генерирует TanStack Router из файлов в src/routes "
                             "(при `npm run dev` / `npm run build`).",
}


def main():
    payload = json.load(sys.stdin)
    path = payload.get("tool_input", {}).get("file_path", "")
    for marker, reason in GENERATED.items():
        if marker in path:
            print(json.dumps({
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "deny",
                    "permissionDecisionReason": "Сгенерированный файл, править руками нельзя. " + reason,
                }
            }, ensure_ascii=False))
            return


if __name__ == "__main__":
    main()
