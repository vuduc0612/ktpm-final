from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional
from datetime import date, datetime

# Schemas cơ bản


class UserBase(BaseModel):
    """
    Schema cơ bản cho thông tin người dùng
    """
    ho_ten: str
    ngay_sinh: date
    gioi_tinh: str
    quoc_tich: Optional[str] = "Việt Nam"
    dan_toc: Optional[str] = None
    ton_giao: Optional[str] = None
    
    so_cccd: str
    ngay_cap: date
    noi_cap: str
    
    dia_chi_thuong_tru: str
    noi_o_hien_tai: Optional[str] = None
    
    dac_diem_nhan_dang: Optional[str] = None
    
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

    @validator('so_cccd')
    def validate_cccd(cls, v):
        if not v.isdigit() or len(v) != 12:
            raise ValueError('Số CCCD phải có 12 chữ số')
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        if v is not None and (not v.isdigit() or not (9 <= len(v) <= 12)):
            raise ValueError('Số điện thoại không hợp lệ')
        return v


class UserCreate(UserBase):
    """
    Schema cho việc tạo User mới
    """
    password: str
    
    class Config:
        orm_mode = True


class UserUpdate(BaseModel):
    """
    Schema cho việc cập nhật User
    """
    ho_ten: Optional[str] = None
    ngay_sinh: Optional[date] = None
    gioi_tinh: Optional[str] = None
    quoc_tich: Optional[str] = None
    dan_toc: Optional[str] = None
    ton_giao: Optional[str] = None
    
    noi_o_hien_tai: Optional[str] = None
    dac_diem_nhan_dang: Optional[str] = None
    
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    
    class Config:
        orm_mode = True


class UserInDBBase(UserBase):
    """
    Schema cơ sở cho User trong DB
    """
    id: str
    is_active: bool
    is_admin: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True


class User(UserInDBBase):
    """
    Schema cho trả về thông tin User
    """
    pass


class UserInDB(UserInDBBase):
    """
    Schema cho User trong DB có chứa hashed_password
    """
    hashed_password: str 