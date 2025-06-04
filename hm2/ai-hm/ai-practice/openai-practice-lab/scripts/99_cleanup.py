#!/usr/bin/env python3
"""
99 — Cleanup Script

Удаляет ассистента OpenAI и все загруженные файлы, а также очищает файл .assistant.

Usage: python scripts/99_cleanup.py
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

def get_client():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ Error: OPENAI_API_KEY not found")
        sys.exit(1)
    return OpenAI(api_key=api_key)

def load_assistant_id():
    assistant_file = Path(".assistant")
    if assistant_file.exists():
        return assistant_file.read_text().strip()
    return None

def delete_assistant(client, assistant_id):
    try:
        print(f"🗑️ Deleting assistant: {assistant_id}")
        client.beta.assistants.delete(assistant_id=assistant_id)
        print("✅ Assistant deleted.")
    except Exception as e:
        print(f"⚠️ Failed to delete assistant: {e}")

def delete_all_files(client):
    try:
        print("📂 Fetching uploaded files...")
        files = client.files.list().data
        if not files:
            print("ℹ️ No files found.")
            return
        for f in files:
            print(f"🗑️ Deleting file: {f.id} ({f.filename})")
            client.files.delete(f.id)
        print("✅ All files deleted.")
    except Exception as e:
        print(f"⚠️ Failed to delete files: {e}")

def remove_local_artifacts():
    assistant_file = Path(".assistant")
    if assistant_file.exists():
        assistant_file.unlink()
        print("🧹 Removed .assistant file.")
    else:
        print("ℹ️ .assistant file not found.")

def main():
    print("\n🧼 Cleanup Script")
    print("=" * 50)

    client = get_client()
    assistant_id = load_assistant_id()

    if assistant_id:
        delete_assistant(client, assistant_id)
    else:
        print("ℹ️ No assistant ID found.")

    delete_all_files(client)
    remove_local_artifacts()

    print("\n✅ Cleanup complete.")

if __name__ == "__main__":
    main()