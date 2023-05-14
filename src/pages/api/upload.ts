// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import * as fs from "fs";
import multiparty from "multiparty";
import { NextApiRequest, NextApiResponse } from "next";
import { NFTStorage } from "nft.storage";
import { File } from "web3.storage";

type Form = {
  fields: any;
  files: any;
};

function parseForm(req: NextApiRequest): Promise<Form> {
  const form = new multiparty.Form();
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          fields,
          files,
        });
      }
    });
  });
}

function getNFTStorageToken() {
  const token = process.env.NFT_STORAGE_TOKEN;
  if (!token) throw new Error(`Misconfigured: NFT.storage token`);
  return token;
}

const nftStorage = new NFTStorage({ token: getNFTStorageToken() });

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = await parseForm(req);
  const title = form.fields.title[0];
  const description = form.fields.description[0];
  const budget = form.fields.budget[0];
  const ad = form.files.media[0];
  const name = ad.originalFilename;
  const url = form.fields.url[0];
  const targetedGroups = form.fields.targetedGroups[0].split("|");
  const adFile = new File([fs.readFileSync(ad.path)], name);

  const uploadedAd = await nftStorage.store({
    name: title,
    description: description,
    image: adFile,
    properties: {
      budget: budget,
      targetedGroups: targetedGroups,
      adUrl: url,
    },
  });
  return res.status(200).json({ cid: uploadedAd.url });
}

// first we need to disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};
export default handler;
