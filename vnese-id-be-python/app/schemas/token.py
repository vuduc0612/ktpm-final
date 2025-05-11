from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    """
    Schema cho token trả về
    """
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    """
    Schema cho payload của token
    """
    sub: Optional[str] = None

class LoginForm(BaseModel):
    """
    Schema cho form đăng nhập
    """
    username: str  # Có thể là email hoặc số CCCD
    password: str 