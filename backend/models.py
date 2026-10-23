from typing import Optional
from sqlmodel import Field, SQLModel

class URLItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    original_url: str
    short_code: str = Field(unique=True, index=True)
