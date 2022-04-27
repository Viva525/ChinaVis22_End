import pandas as pd
import os
import csv
from tqdm import tqdm

node = pd.read_csv('./data/Node.csv')
community = pd.read_csv('./data/node-community.csv')
node = pd.merge(node, community, left_on='id',
                right_on='id', how='left')
# node.drop(columns=["name", "type", "industry"], inplace=True)
del community

with open('modify.csv','a+', encoding='utf-8-sig',newline='') as f:#r为标识符，表示只读
    writer = csv.writer(f)
    # cname = pd.read_csv(
    #     './processedData/Edge/domain-cname.csv').drop(columns=[":TYPE", "weight:int"])
    # for i, row in tqdm(cname.iterrows()):
    #     c_start = node[node["id"] == row[":START_ID"]]["community"].values[0]
    #     c_end = node[node["id"] == row[":END_ID"]]["community"].values[0]
    #     if(c_start != c_end):
    #         writer.writerow([c_end, c_start])
    #         node.loc[node["community"] == c_end, ["community"]] = c_start
        

    subdomain = pd.read_csv(
        './processedData/Edge/domain-subdomain.csv').drop(columns=[":TYPE", "weight:int"])
    for i, row in tqdm(subdomain.iterrows()):
        s_start = node[node["id"] == row[":START_ID"]]["community"].values[0]
        s_end = node[node["id"] == row[":END_ID"]]["community"].values[0]
        if(s_start != s_end):
            writer.writerow([s_end, s_start])
            node.loc[node["community"] == s_end, ["community"]] = s_start
        
    node.to_csv('CommunityNode.csv', index=False, encoding="utf-8-sig")
