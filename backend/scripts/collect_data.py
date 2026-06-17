"""
数据采集脚本 - 定时采集行情数据
"""
import asyncio
import sys
from pathlib import Path

# 添加项目根目录到Python路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.data_collector import data_collector


async def collect_a_share():
    """采集A股数据"""
    print("📊 开始采集A股数据...")
    stocks = await data_collector.get_a_share_realtime()
    print(f"✅ A股数据采集完成: {len(stocks)} 只")
    return stocks


async def collect_hk_share():
    """采集港股数据"""
    print("📊 开始采集港股数据...")
    stocks = await data_collector.get_hk_realtime()
    print(f"✅ 港股数据采集完成: {len(stocks)} 只")
    return stocks


async def collect_us_share():
    """采集美股数据"""
    print("📊 开始采集美股数据...")
    stocks = await data_collector.get_us_realtime()
    print(f"✅ 美股数据采集完成: {len(stocks)} 只")
    return stocks


async def main():
    """主函数"""
    print("=" * 50)
    print("QuantX 数据采集工具")
    print("=" * 50)

    try:
        # 并发采集三个市场
        results = await asyncio.gather(
            collect_a_share(),
            collect_hk_share(),
            collect_us_share(),
            return_exceptions=True,
        )

        for i, result in enumerate(results):
            market = ["A股", "港股", "美股"][i]
            if isinstance(result, Exception):
                print(f"❌ {market}采集失败: {result}")
            else:
                print(f"✅ {market}采集成功")

    except Exception as e:
        print(f"❌ 采集失败: {e}")
        return 1

    return 0


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
