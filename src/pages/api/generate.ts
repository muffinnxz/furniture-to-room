import axios from "axios";
import FormData from "form-data";
import type { NextApiRequest, NextApiResponse } from "next/types";
import cv from "@techstark/opencv-js";
import Jimp from "jimp";

interface GenerationResponse {
  artifacts: Array<{
    base64: string;
    seed: number;
    finishReason: string;
  }>;
}

interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    prompt: string;
    imageUrl: string;
    imageMaskUrl: string;
  };
}

async function convertDataURIToBuffer(dataURI: string) {
  let image = await axios.get(dataURI, { responseType: "arraybuffer" });
  return Buffer.from(image.data);
}

export default async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse<GenerationResponse>
) {
  const { prompt, imageUrl, imageMaskUrl } = req.body;

  const result = await Jimp.read(imageUrl)
    .then(async (image) => {
      return await Jimp.read(imageMaskUrl)
        .then(async (maskImage) => {
          const img1 = cv.matFromImageData(image.bitmap);
          const img2 = cv.matFromImageData(maskImage.bitmap);

          const base_size = 64;
          const pi = 4;
          const pt = 2,
            pb = 2,
            pl = 2,
            pr = 2;

          cv.resize(
            img1,
            img1,
            new cv.Size(pi * base_size, pi * base_size),
            0,
            0,
            cv.INTER_AREA
          );
          cv.resize(
            img2,
            img2,
            new cv.Size(pi * base_size, pi * base_size),
            0,
            0,
            cv.INTER_AREA
          );

          let pad1 = new cv.Mat();
          let pad2 = new cv.Mat();
          let s = new cv.Scalar(0, 0, 0, 255);
          cv.copyMakeBorder(
            img1,
            pad1,
            pt * base_size,
            pb * base_size,
            pl * base_size,
            pr * base_size,
            cv.BORDER_CONSTANT,
            s
          );
          cv.copyMakeBorder(
            img2,
            pad2,
            pt * base_size,
            pb * base_size,
            pl * base_size,
            pr * base_size,
            cv.BORDER_CONSTANT,
            s
          );

          cv.cvtColor(pad2, pad2, cv.COLOR_RGBA2GRAY, 0);
          cv.threshold(pad2, pad2, 177, 255, cv.THRESH_BINARY);
          cv.cvtColor(pad2, pad2, cv.COLOR_GRAY2RGBA);

          const jimpImg1 = new Jimp({
            width: pad1.cols,
            height: pad1.rows,
            data: Buffer.from(pad1.data),
          });
          // jimpImg1.write("test.png");

          const jimpImg2 = new Jimp({
            width: pad2.cols,
            height: pad2.rows,
            data: Buffer.from(pad2.data),
          });
          // jimpImg2.write("test2.png");

          let responseJSON: GenerationResponse | null = null;

          const formData = new FormData();
          jimpImg1.getBuffer(Jimp.MIME_PNG, async (e, buffer) => {
            jimpImg2.getBuffer(Jimp.MIME_PNG, async (e, buffer2) => {
              // https://platform.stability.ai/rest-api#tag/v1generation/operation/masking
              formData.append("init_image", buffer);
              formData.append("mask_image", buffer2);
              formData.append("mask_source", "MASK_IMAGE_BLACK");
              formData.append("text_prompts[0][text]", prompt.toLowerCase());
              formData.append("cfg_scale", "9");
              formData.append("samples", 4);
              formData.append("steps", 30);
              formData.append("style_preset", "3d-model");
            });
          });

          let startResponse = await axios.post(
            "https://api.stability.ai/v1/generation/stable-inpainting-512-v2-0/image-to-image/masking",
            formData,
            {
              headers: {
                ...formData.getHeaders(),
                Accept: "application/json",
                Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
              },
            }
          );

          responseJSON = (await startResponse?.data) as GenerationResponse;

          return responseJSON;
        })
        .catch((err) => {
          console.log(err);
          return null;
        });
    })
    .catch((err) => {
      console.log(err);
      return null;
    });
  res.status(200).json(result ? result : { artifacts: [] });
}
