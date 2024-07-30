import sys
from castlabs_evs import account

if __name__ == "__main__":
    arg1 = sys.argv[1]
    arg2 = sys.argv[2]
    print(f"Received arguments: {arg1}, {arg2}")
    # 创建 Account 类的实例
    account_instance = account.Account()
    # 调用 reauth 方法
    account_instance.reauth(arg1, arg2)
