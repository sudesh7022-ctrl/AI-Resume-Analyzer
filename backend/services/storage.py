import os
import shutil
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

class SupabaseStorage:
    def __init__(self):
        self.url = os.environ.get("SUPABASE_URL", "").strip()
        self.key = os.environ.get("SUPABASE_KEY", "").strip()
        self.bucket_name = os.environ.get("SUPABASE_BUCKET_NAME", "resumes")

        # Local storage setup as fallback
        self.local_dir = Path("uploads")
        self.local_dir.mkdir(exist_ok=True)
        self.base_url = os.environ.get("BACKEND_URL", "http://localhost:8000").rstrip("/")

        if not self.url or not self.key:
            print("⚠️ [STORAGE] Supabase credentials missing — Using Local Storage Mode only.")
            self.client = None
            return

        try:
            self.client: Client = create_client(self.url, self.key)
        except Exception as e:
            print(f"⚠️ [STORAGE] Connection to Supabase failed: {e} — Falling back to Local Storage.")
            self.client = None

    async def upload_file(self, file_content: bytes, file_name: str) -> str:
        """
        Uploads a file to Supabase Storage, or falls back to local storage if necessary.
        Returns the public URL or local file URL.
        """
        # Try Supabase first if client is available
        if self.client:
            try:
                # Upload to the specified bucket
                self.client.storage.from_(self.bucket_name).upload(
                    path=file_name,
                    file=file_content,
                    file_options={"content-type": "application/pdf"}
                )
                
                # Get public URL
                public_url = self.client.storage.from_(self.bucket_name).get_public_url(file_name)
                print(f"✅ [STORAGE] Uploaded to Supabase: {public_url}")
                return public_url
            except Exception as e:
                # Check if it's a connection/DNS error to trigger fallback
                error_str = str(e).lower()
                if "getaddrinfo" in error_str or "connection" in error_str:
                    print(f"⚠️ [STORAGE] Supabase unreachable ({e}). Using Local Storage fallback.")
                else:
                    print(f"❌ [STORAGE] Supabase upload failed: {e}")
                    raise e
        
        # Fallback to Local Storage
        try:
            local_path = self.local_dir / file_name
            with open(local_path, "wb") as f:
                f.write(file_content)
            
            local_url = f"{self.base_url}/uploads/{file_name}"
            print(f"📂 [STORAGE] Saved to Local Storage: {local_url}")
            return local_url
        except Exception as local_err:
            print(f"❌ [STORAGE] Local storage fallback also failed: {local_err}")
            raise local_err

storage_service = SupabaseStorage()
