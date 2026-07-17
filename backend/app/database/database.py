from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, DeclarativeBase
import os

DATABASE_URL = os.getenv("DATABASE_URL", "")

if DATABASE_URL and "postgresql" in DATABASE_URL:
    if "asyncpg" not in DATABASE_URL:
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    engine = create_async_engine(DATABASE_URL, echo=False)
else:
    DATABASE_URL = "sqlite+aiosqlite:///./projectpulse.db"
    engine = create_async_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})

async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        yield session
