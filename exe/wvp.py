import sys
from castlabs_evs import account,vmp

if __name__ == "__main__":
    arg1 = sys.argv[1]
    arg2 = sys.argv[2]
    arg3 = sys.argv[3]
    print(f"Received arguments: {arg1}, {arg2}, {arg3}")
    # 创建 Account 类的实例
    account_instance = account.Account()
    vmp_instance = vmp.VMP()
    # 调用 reauth 方法
    account_instance.reauth(arg1, arg2)
    vmp_instance.sign_pkg(arg3)
