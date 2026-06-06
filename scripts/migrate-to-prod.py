#!/usr/bin/env python3
"""
Migrate lessons and levels from local backend to production.
Usage: python3 scripts/migrate-to-prod.py
"""

import json
import urllib.request
import urllib.parse
import urllib.error
import sys
import time

LOCAL  = "http://localhost:8081"
PROD   = "http://186.246.5.197"
SECRET = "supersecret2026"

def req(url, method="GET", body=None, headers=None):
    data = json.dumps(body).encode() if body else None
    h = {"Content-Type": "application/json", "X-Admin-Secret": SECRET}
    if headers:
        h.update(headers)
    r = urllib.request.Request(url, data=data, headers=h, method=method)
    try:
        with urllib.request.urlopen(r, timeout=15) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body_txt = e.read().decode()
        print(f"  HTTP {e.code} {url}: {body_txt[:200]}")
        return None

# ── 1. Fetch local data ──────────────────────────────────────────────────────
print("=== Fetching local data ===")
local_lessons = req(f"{LOCAL}/api/admin/lessons")
local_levels  = req(f"{LOCAL}/api/levels")
if not local_lessons:
    sys.exit("Cannot reach local backend on :8081")

# Filter only real content (skip test data like 'укцуф')
real_lessons = [l for l in local_lessons if l.get("level") == "level1"]
print(f"Real lessons to migrate: {len(real_lessons)}")

modules = {}
for l in real_lessons:
    m = l.get("module", "")
    modules[m] = modules.get(m, 0) + 1
for m, cnt in sorted(modules.items()):
    print(f"  module={m}: {cnt} lessons")

# ── 2. Fetch prod data ───────────────────────────────────────────────────────
print("\n=== Fetching prod data ===")
prod_lessons = req(f"{PROD}/api/admin/lessons")
prod_levels  = req(f"{PROD}/api/levels")
print(f"Prod currently has: {len(prod_lessons)} lessons, {len(prod_levels)} levels")

# ── 3. Ensure level exists on prod ──────────────────────────────────────────
print("\n=== Syncing levels ===")
prod_level_slugs = {lv["slug"] for lv in prod_levels}

# Use slug "основы-go" to avoid soft-delete conflicts
TARGET_LEVEL_SLUG = "основы-go"

if TARGET_LEVEL_SLUG not in prod_level_slugs:
    print(f"Creating level '{TARGET_LEVEL_SLUG}' on prod...")
    result = req(f"{PROD}/api/admin/levels", method="POST", body={
        "title": "Основы Go",
        "slug": TARGET_LEVEL_SLUG,
        "order": 1,
        "description": "Фундаментальные знания Go для backend-разработчика"
    })
    if result and result.get("id"):
        print(f"  Created: id={result.get('id')} slug={result.get('slug')}")
    else:
        print("  Failed to create level — stopping")
        sys.exit(1)
else:
    print(f"Level '{TARGET_LEVEL_SLUG}' already exists on prod")

# ── 4. Skip already-existing lessons on prod ─────────────────────────────────
print("\n=== Migrating lessons ===")
prod_titles = {l["title"] for l in prod_lessons}
prod_slugs  = {l["slug"] for l in prod_lessons}

to_create = [l for l in real_lessons if l["title"] not in prod_titles]
to_skip   = [l for l in real_lessons if l["title"] in prod_titles]
print(f"Already on prod (skip): {len(to_skip)}")
print(f"Will create: {len(to_create)}")

import hashlib

def safe_slug(lesson):
    # Generate a unique slug: original slug + short hash of title to avoid soft-delete conflicts
    base = lesson["slug"]
    h = hashlib.md5(lesson["title"].encode()).hexdigest()[:6]
    return f"{base}-{h}"

created = 0
failed  = 0
for lesson in sorted(to_create, key=lambda x: (x.get("module",""), x.get("order", 0))):
    payload = {
        "title":       lesson["title"],
        "slug":        safe_slug(lesson),
        "level":       TARGET_LEVEL_SLUG,  # use the level slug that exists on prod
        "module":      lesson["module"],
        "description": lesson.get("description", ""),
        "content":     lesson.get("content", ""),
        "order":       lesson.get("order", 0),
        "category":    lesson.get("category", ""),
    }
    result = req(f"{PROD}/api/admin/lessons", method="POST", body=payload)
    if result and result.get("id"):
        print(f"  ✓ [{lesson.get('module')}] {lesson['title']}")
        created += 1
    else:
        print(f"  ✗ [{lesson.get('module')}] {lesson['title']}")
        failed += 1
    time.sleep(0.05)  # be gentle to the server

print(f"\n=== Done ===")
print(f"Created: {created}, Skipped: {len(to_skip)}, Failed: {failed}")

# ── 5. Verify ────────────────────────────────────────────────────────────────
prod_lessons_after = req(f"{PROD}/api/admin/lessons") or []
print(f"\nProd now has {len(prod_lessons_after)} lessons total")
mods = {}
for l in prod_lessons_after:
    m = l.get("module","?")
    mods[m] = mods.get(m,0) + 1
for m, cnt in sorted(mods.items()):
    print(f"  {m}: {cnt}")
