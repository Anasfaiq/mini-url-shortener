import string
import random
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, SQLModel
from pydantic import BaseModel

from database import engine, get_session
from models import URLItem

# fungsi untuk membuat kombinasi huruf dan angka acak
def generate_short_code(length=5):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

# skema dta JSON yang akan diterima dari frontend react
class URLRequest(BaseModel):
    original_url: str

# membuat tabel database otomatis saat server mulai
@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield
app = FastAPI(lifespan=lifespan)

# mengizinkan akses API dari frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# endpoint 1: menerima URL panjang dan menyimpan kode pendeknya
@app.post("/shorten")
def shorten_url(request: URLRequest, session: Session = Depends(get_session)):
    short_code = generate_short_code()

    # bungkus data ke format model tabel
    new_url = URLItem(original_url=request.original_url, short_code=short_code)

    # simpan ke database
    session.add(new_url)
    session.commit()
    session.refresh(new_url)

    return {
        "short_url": f"http://localhost:8000/{short_code}",
        "short_code": short_code
    }

# endpoint 2: menerima akses link pendek dan melempar user ke URL asli
@app.get("/{short_code}")
def redirect_url(short_code: str, session: Session = Depends(get_session)):
    # cari baris data yang shortcode nya cocok
    statement = select(URLItem).where(URLItem.short_code == short_code)
    url_item = session.exec(statement).first()

    if not url_item:
        raise HTTPException(status_code=404, detail="URL tidak ditemukan")

    # lakukan redirect ke link asli
    return RedirectResponse(url=url_item.original_url)