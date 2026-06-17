"""
Redis缓存
"""
import redis.asyncio as redis
from app.core.config import settings


class RedisCache:
    """Redis缓存客户端"""

    def __init__(self):
        self.redis: redis.Redis = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            decode_responses=True,
        )

    async def get(self, key: str) -> str | None:
        """获取缓存"""
        return await self.redis.get(key)

    async def set(self, key: str, value: str, expire: int = 60) -> None:
        """设置缓存"""
        await self.redis.set(key, value, ex=expire)

    async def delete(self, key: str) -> None:
        """删除缓存"""
        await self.redis.delete(key)

    async def close(self):
        """关闭连接"""
        await self.redis.close()


cache = RedisCache()
