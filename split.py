import pandas as pd
import os
from tqdm import tqdm
'''
split link
'''
if not os.path.exists("splitEdge"):
    os.mkdir("splitEdge")

df = pd.read_csv('./data/Link.csv')

for key, group in tqdm(df.groupby("relation")):

    # group = group.drop(columns='relation')
    group.reset_index(drop=True, inplace=True)
    group.rename(columns={"relation": ":TYPE",
                          "source": ":START_ID",
                          "target": ":END_ID"},  inplace=True)

    if key in ["r_cert", "r_subdomain", "r_request_jump", "r_dns_a"]:
        group.insert(group.shape[1], "weight:int", 2)
    elif key in ["r_cert_chain", "r_cname"]:
        group.insert(group.shape[1], "weight:int", 1)
    group.to_csv(
        './splitEdge/' + key + '.csv', index=False, encoding='utf_8_sig')

'''
split node
'''
# get work Path
path = os.getcwd()
# read csv file
dataFrame = pd.read_csv(path+"\\data\\CommunityNode.csv")
# group
groups = dataFrame.groupby("type")

Domain_gp = groups.get_group("Domain")
IP_gp = groups.get_group("IP")
Cert_gp = groups.get_group("Cert")
Register_Name_gp = groups.get_group("Whois_Name")
Register_Email_gp = groups.get_group("Whois_Email")
Register_Phone_gp = groups.get_group("Whois_Phone")
IPC_gp = groups.get_group("IP_C")
ASN_gp = groups.get_group("ASN")

# split DF
Domain = Domain_gp.set_index("id")
IP = IP_gp.drop("industry", axis=1).set_index("id")
Cert = Cert_gp.drop("industry", axis=1).set_index("id")
Register_Name = Register_Name_gp.drop("industry", axis=1).set_index("id")
Register_Email = Register_Email_gp.drop("industry", axis=1).set_index("id")
Register_Phone = Register_Phone_gp.drop("industry", axis=1).set_index("id")
IPC = IPC_gp.drop("industry", axis=1).set_index("id")
ASN = ASN_gp.drop("industry", axis=1).set_index("id")

if not os.path.exists("splitNode"):
    os.mkdir("splitNode")
Domain.to_csv(path+"\\splitNode\\Domain.csv", encoding='utf_8_sig')
print("Domain finished")
IP.to_csv(path+"\\splitNode\\IP.csv", encoding='utf_8_sig')
print("IP finished")
Cert.to_csv(path+"\\splitNode\\Cert.csv", encoding='utf_8_sig')
print("Domain finished")
Register_Name.drop(columns=["community"])
Register_Name.to_csv(path+"\\splitNode\\Register_Name.csv",
                     encoding='utf_8_sig')
print("Register_Name finished")
Register_Email.drop(columns=["community"])
Register_Email.to_csv(
    path+"\\splitNode\\Register_Email.csv", encoding='utf_8_sig')
print("Register_Email finished")
Register_Phone.drop(columns=["community"])
Register_Phone.to_csv(
    path+"\\splitNode\\Register_Phone.csv", encoding='utf_8_sig')
print("Register_Phone finished")
IPC.drop(columns=["community"])
IPC.to_csv(path+"\\splitNode\\IPC.csv", encoding='utf_8_sig')
print("IPC finished")
ASN.drop(columns=["community"])
ASN.to_csv(path+"\\splitNode\\ASN.csv", encoding='utf_8_sig')
print("ASN finished")
