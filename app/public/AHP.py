# coding: utf-8

# In[ ]:
import numpy as np
R_I = [0, 0, 0.52, 0.89, 1.12, 1.26, 1.36, 1.41, 1.46, 1.49, 1.52, 1.54, 1.56, 1.58,1.59]
def isConsist(A):
    n = len(A)
    V, D = np.linalg.eig(A)  # 计算特征向量
    eig_max = max(V)  # 最大的特征值λ
    CI = (eig_max - n) / (n - 1)
    RI = R_I[n - 1]
    CR = CI / RI
    if CI < 0.1:
        return bool(1)
    else:
        return bool(0)


def s_s_a(A):
    w_1 = sum(A) / len(A)
    return w_1  # 得到权重矩阵




def t_v(A):
    V, D = np.linalg.eig(A)  # 计算特征向量
    eig_max = max(V)  # 最大的特征值λ
    c = np.where(V == eig_max)
    B_3 = D[:, c.index(0)]
    w_3 = B_3 / sum(B_3)
    return w_3


# 权重 输入进来的是四组数据 分别为节点跳数 关联重要性 目标节点字段
'''传入格式   关联重要性得输入字段
方案
节点跳数     3 2 2  
关联重要性   3 4 2
目标字段     1 4 5

'''


def get_B(B):
    B = B.T  # 按列放置
    B_1 = B[0]  # 节点跳数
    B_2 = B[1]  # 关联重要性
    for i in range(B_2):
        if B_2[i] == "r_cert" or B_2[i] == "r_subdomain" or B_2[i] == "r_request_jump" or B_2[i] == "r_dns_a":
            B_2[i] = 9
        elif B_2[i] == "IP" or B_2[i] == "r_whois_name" or B_2[i] == "r_whois_email":
            B_2[i] = 6
        elif B_2[i] == "r_cert_chain" or B_2[i] == "r_cname":
            B_2[i] = 3
        else:
            B_2[i] = 1
    B_3 = B[2]  # 目标字段
    for i in range(B_3):
        if B_3[i] == "Domain" or B_3[i] == "IP" or B_3[i] == "Cert":
            B_3[i] = 9
        elif B_3[i] == "Whois_Name" or B_3[i] == "Whois_Phone" or B_3[i] == "Whois_Email":
            B_3[i] = 5
        else:
            B_3[i] = 1


    # 节点跳数
    B_1_1 = np.eye(len(B))
    for i in range(len(B)):
        for j in range(len(B)):
            B_1_1[i][j] = B_1[i] / B_1[j]
    # 关联重要性
    B_2_1 = np.eye(len(B))
    for i in range(len(B)):
        for j in range(len(B)):
            B_2_1[i][j] = B_2[i] / B_2[j]

    # 目标字段
    B_3_1 = np.eye(len(B))
    for i in range(len(B)):
        for j in range(len(B)):
            B_3_1[i][j] = B_3[i] / B_3[j]
    matrix = []
    if isConsist(B_1_1) and isConsist(B_2_1) and isConsist(B_3_1):
        w_0 = t_v(B_1_1)  # 得到指标权重矩阵
        w_1 = t_v(B_2_1)
        w_2 = t_v(B_3_1)
        matrix.append(w_0)
        matrix.append(w_1)
        matrix.append(w_2)


def main(A, B):  # B为各方案的评分矩阵,shape为n*3 行*列  方案数*指标数
    if isConsist(A):
        W_0 = t_v(A)  # 得到指标权重矩阵
        score = []
        for i in range(len(B)):  # 方案序列
            sum_score = 0
            for j in range(W_0):  # 求该方案的值
                sum_score += W_0[j] * B[i][j]
            score.append(sum_score)
        return score  # 返回得分序列
