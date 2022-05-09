from tqdm import tqdm
import pandas as pd
import numpy as np
tqdm.pandas(desc="thread")


df = pd.concat([pd.read_csv('./processedData/Edge/cert-cert.csv'), 
                pd.read_csv('./processedData/Edge/domain-cert.csv'), 
                pd.read_csv('./processedData/Edge/domain-cname.csv'), 
                pd.read_csv('./processedData/Edge/domain-domain.csv'), 
                pd.read_csv('./processedData/Edge/domain-IP.csv'), 
                pd.read_csv('./processedData/Edge/domain-subdomain.csv')])
index = pd.read_csv('./data/node-community.csv')  

df = df[x:x]

list = []

def fc(row):
    a = index[index['id']==row[":START_ID"]]["community"].values[0]
    b = index[index['id']==row[":END_ID"]]["community"].values[0]
    if(a!=b):
        list.append([a, b])
df.progress_apply(fc, axis=1)

arr = np.array(list)
write_df = pd.DataFrame(arr).drop_duplicates(keep='first',inplace=True)
write_df.to_csv('community-link.csv', index=False, encoding="utf-8-sig")