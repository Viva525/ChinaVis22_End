from unittest import case
import pandas as pd
import re
import os
from shutil import copyfile
from tqdm import tqdm
tqdm.pandas(desc="split industry")

dict_map = {
    "A": "porn",
    "B": "gambling",
    "C": "fraud",
    "D": "drug",
    "E": "gun",
    "F": "hacker",
    "G": "trading",
    "H": "pay",
    "I": "other"
}
nodepath = './splitNode/'
edgepath = './splitEdge/'
saveNodePath = './processedData/Node/'
saveEdgePath = './processedData/Edge/'
if not os.path.exists(saveNodePath):
    os.makedirs(saveNodePath)
if not os.path.exists(saveEdgePath):
    os.makedirs(saveEdgePath)


# def split_industry(str):
#     res = {"porn": False, "gambling": False, "fraud": False, "drug": False,
#            "gun": False, "hacker": False, "trading": False, "pay": False, "other": False}
#     for s in re.findall('[A-Z]', str):
#         res[dict_map[s]] = True
#     return res


def apply_split(row):
    res = re.findall('[A-Z]', row['industry'])
    for s in res:
        row[dict_map[s]] = True
    row["weight:int"] = len(res)
    return row


'''
Merge domain and (email, name, phone)
Split industry into 9 attributes
'''
df = pd.read_csv(nodepath + 'Domain.csv')

# merge domain & email
df_whois_Email = pd.read_csv(edgepath + 'r_whois_email.csv')
df_whois_Email.drop_duplicates(
    subset=[':START_ID'], keep='first', inplace=True)
df_Email = pd.read_csv(nodepath + 'Register_Email.csv')

df = pd.merge(df, df_whois_Email, left_on='id',
              right_on=':START_ID', how='left')
df = pd.merge(df, df_Email, left_on=':END_ID', right_on='id', how='left')

df = df.drop(columns=[":TYPE", ":START_ID", ":END_ID", "type_y"])
df.rename(columns={"id_x": "id",
                   "id_y": "email_id",
                   "name_x": "name",
                   "type_x": "type",
                   "name_y": "email",
                   "community": "community:int"},  inplace=True)
print(df.columns)

# merge domain & name
df_whois_Name = pd.read_csv(edgepath + 'r_whois_name.csv')
df_whois_Name.drop_duplicates(subset=[':START_ID'], keep='first', inplace=True)
df_Name = pd.read_csv(nodepath + 'Register_Name.csv')

df = pd.merge(df, df_whois_Name, left_on='id',
              right_on=':START_ID', how='left')
df = pd.merge(df, df_Name, left_on=':END_ID', right_on='id', how='left')

df = df.drop(columns=[":TYPE", ":START_ID", ":END_ID", "type_y"])
df.rename(columns={"id_x": "id",
                   "id_y": "register_id",
                   "name_x": "name",
                   "type_x": "type",
                   "name_y": "register"},  inplace=True)
print(df.columns)

# merge domain & phone
df_whois_Phone = pd.read_csv(edgepath + 'r_whois_Phone.csv')
df_whois_Phone.drop_duplicates(
    subset=[':START_ID'], keep='first', inplace=True)
df_Phone = pd.read_csv(nodepath + 'Register_Phone.csv')

df = pd.merge(df, df_whois_Phone, left_on='id',
              right_on=':START_ID', how='left')
df = pd.merge(df, df_Phone, left_on=':END_ID', right_on='id', how='left')

df = df.drop(columns=[":TYPE", ":START_ID", ":END_ID", "type_y"])
df.rename(columns={"id_x": "id:ID",
                   "id_y": "phone_id",
                   "name_x": "name",
                   "type_x": ":LABEL",
                   "name_y": "phone"},  inplace=True)
print(df.columns)

# split industry
# industries = pd.DataFrame(columns=list(dict_map.values()))
# for value in tqdm(df.industry):
#     industries.loc[industries.index.size] = list(
#         split_industry(value).values())
# df = pd.concat([df, industries], axis=1).drop(columns="industry")

for insert_c in list(dict_map.values()):
    df.insert(df.shape[1], insert_c, False)

df.insert(df.shape[1], "weight:int", 0)

df = df.progress_apply(apply_split, axis=1)
df = df.drop(columns="industry")
df["community:int"] = df["community:int"].astype(int)
df.to_csv(saveNodePath + 'Domain.csv', index=False, encoding="utf-8-sig")

'''
Merge IP and (asn, cidr)
'''
df = pd.read_csv(nodepath + 'IP.csv')

# merge IP & ASN
df_r_asn = pd.read_csv(edgepath + 'r_asn.csv')
df_r_asn.drop_duplicates(subset=[':START_ID'], keep='first', inplace=True)
df_ASN = pd.read_csv(nodepath + 'ASN.csv')

df = pd.merge(df, df_r_asn, left_on='id', right_on=':START_ID', how='left')
df = pd.merge(df, df_ASN, left_on=':END_ID', right_on='id', how='left')


df = df.drop(columns=[":TYPE", ":START_ID", ":END_ID", "type_y"])
df.rename(columns={"id_x": "id",
                   "id_y": "asn_id",
                   "name_x": "name",
                   "type_x": "type",
                   "name_y": "asn",
                   "community": "community:int"},  inplace=True)
print(df.columns)

# merge IP & IPC
df_cidr = pd.read_csv(edgepath + 'r_cidr.csv')
df_cidr.drop_duplicates(subset=[':START_ID'], keep='first', inplace=True)
df_IPC = pd.read_csv(nodepath + 'IPC.csv')

df = pd.merge(df, df_cidr, left_on='id', right_on=':START_ID', how='left')
df = pd.merge(df, df_IPC, left_on=':END_ID', right_on='id', how='left')


df = df.drop(columns=[":TYPE", ":START_ID", ":END_ID", "type_y"])
df.rename(columns={"id_x": "id:ID",
                   "id_y": "ipc_id",
                   "name_x": "name",
                   "type_x": ":LABEL",
                   "name_y": "ipc"},  inplace=True)
print(df.columns)
df["community:int"] = df["community:int"].astype(int)
df.to_csv(saveNodePath + 'IP.csv', index=False, encoding="utf-8-sig")

'''
Rename Cert
'''
df_cert = pd.read_csv(nodepath + 'Cert.csv')
df_cert.rename(columns={"id": "id:ID",
                        "type": ":LABEL",
                        "community": "community:int"},  inplace=True)
print(df_cert.columns)
df_cert["community:int"] = df_cert["community:int"].astype(int)
df_cert.to_csv(saveNodePath + 'Cert.csv',
               index=False, encoding="utf-8-sig")


'''
Select Edge
'''
splitEdge = os.listdir(edgepath)
for file in tqdm(splitEdge):
    if file == 'r_cert_chain.csv':
        copyfile(edgepath + file, saveEdgePath + 'cert-cert.csv')
    elif file == 'r_cert.csv':
        copyfile(edgepath + file, saveEdgePath + 'domain-cert.csv')
    elif file == 'r_cname.csv':
        copyfile(edgepath + file, saveEdgePath + 'domain-cname.csv')
    elif file == 'r_dns_a.csv':
        copyfile(edgepath + file, saveEdgePath + 'domain-IP.csv')
    elif file == 'r_request_jump.csv':
        copyfile(edgepath + file, saveEdgePath + 'domain-domain.csv')
    elif file == 'r_subdomain.csv':
        copyfile(edgepath + file, saveEdgePath + 'domain-subdomain.csv')
    else:
        continue
