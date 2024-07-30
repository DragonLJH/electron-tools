import sys
 
# 假设你有一个名为process_data的函数
def process_data(arg1, arg2):
    # 处理数据
    return [f"Processed: {arg1}, {arg2}"]
 
# 从sys.argv中获取参数
args = sys.argv[1:]
arg1 = args[0]
arg2 = args[1]
 
# 调用函数并获取结果
results = process_data(arg1, arg2)
 
# 将结果返回给Electron
print(results)

def test(arg1, arg2):
    print('------------test------------')
    print(arg1, arg2)
