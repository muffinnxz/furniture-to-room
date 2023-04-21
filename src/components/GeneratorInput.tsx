import {
  roomStyles,
  roomTypes,
  useGenerator,
} from "@/contexts/GeneratorContext";
import { Button, Flex, Image, Select, Text, VStack } from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { UploadDropzone } from "react-uploader";
import { Uploader } from "uploader";

const uploader = Uploader({
  apiKey: !!process.env.NEXT_PUBLIC_UPLOAD_API_KEY
    ? process.env.NEXT_PUBLIC_UPLOAD_API_KEY
    : "free",
});

const options = {
  maxFileCount: 1,
  mimeTypes: ["image/jpeg", "image/png", "image/jpg"],
  editor: { images: { crop: false } },
  styles: {
    colors: { primary: "#2563EB" },
  },
};

export default function GeneratorInput() {
  const {
    roomType,
    setRoomType,
    roomStyle,
    setRoomStyle,
    setImageName,
    setOriginalImage,
    setNoBgOriginalImage,
    setMaskedOriginalImage,
    setGeneratedImage,
    originalImage,
    noBgOriginalImage,
    maskedOriginalImage,
    resultLoading,
    setResultLoading,
  } = useGenerator();
  const [error, setError] = useState<string>("");

  const UploadZone = () => (
    <UploadDropzone
      uploader={uploader}
      options={options}
      onUpdate={(file) => {
        if (file.length !== 0) {
          setImageName(file[0].originalFile.originalFileName);
          const imageUrl = file[0].fileUrl.replace("raw", "thumbnail");
          setOriginalImage(imageUrl);
          setNoBgOriginalImage(null);
          setMaskedOriginalImage(null);
        }
      }}
      width="670px"
      height="250px"
    />
  );

  const generateResult = async () => {
    setError("");
    setResultLoading(true);
    if (!noBgOriginalImage || !maskedOriginalImage) {
      axios
        .post("/api/masking", { imageUrl: originalImage })
        .then((res) => {
          setNoBgOriginalImage(res.data[0]);
          setMaskedOriginalImage(res.data[1]);
          axios
            .post("/api/generate", {
              prompt: `${roomType}, ${roomStyle} style, masterpiece, best quality`,
              imageUrl: originalImage,
              imageMaskUrl: res.data[1],
            })
            .then((res) => {
              console.log(res.data);
              setGeneratedImage(res.data.artifacts);
              setResultLoading(false);
            })
            .catch((err) => {
              setError("Something when wrong, please try again.");
              setResultLoading(false);
            });
        })
        .catch((err) => {
          setError("Something when wrong, please try again.");
          setResultLoading(false);
        });
    } else {
      axios
        .post("/api/generate", {
          prompt: `${roomType}, ${roomStyle} style, masterpiece, best quality`,
          imageUrl: originalImage,
          imageMaskUrl: maskedOriginalImage,
        })
        .then((res) => {
          console.log(res.data);
          setGeneratedImage(res.data.artifacts);
          setResultLoading(false);
        })
        .catch((err) => {
          setError("Something when wrong, please try again.");
          setResultLoading(false);
        });
    }
  };

  return (
    <Flex
      flexDirection={"column"}
      p={8}
      bgColor={"white"}
      borderRadius={8}
      border="1px solid #EFEFEF"
      boxShadow={"md"}
      gap={2}
      w="100%"
    >
      <Text fontWeight={"bold"}>Select room type</Text>
      <Select
        value={roomType}
        onChange={(e) => {
          setRoomType(e.target.value);
        }}
      >
        {roomTypes.map((type, idx) => (
          <option key={idx} value={type}>
            {type}
          </option>
        ))}
      </Select>
      <Text fontWeight={"bold"}>Select room style</Text>
      <Select
        value={roomStyle}
        onChange={(e) => {
          setRoomStyle(e.target.value);
        }}
      >
        {roomStyles.map((style, idx) => (
          <option key={idx} value={style}>
            {style}
          </option>
        ))}
      </Select>
      <Text fontWeight={"bold"}>Upload Image</Text>
      {originalImage ? (
        <Image
          alt="original photo"
          src={originalImage}
          width={"100%"}
          borderRadius={8}
        />
      ) : (
        <UploadZone />
      )}
      <Button
        colorScheme={"spaceblue"}
        onClick={() => {
          generateResult();
        }}
        isDisabled={resultLoading || !originalImage}
      >
        <Text fontWeight={"bold"}>Generate</Text>
      </Button>
      <Button
        colorScheme={"gray"}
        onClick={() => {
          setImageName("");
          setOriginalImage("");
          setNoBgOriginalImage("");
          setMaskedOriginalImage("");
          setGeneratedImage("");
          setResultLoading(false);
        }}
        isDisabled={resultLoading || !originalImage}
      >
        <Text fontWeight={"bold"}>Reset</Text>
      </Button>
      <Text color={"red.300"}>{error}</Text>
    </Flex>
  );
}
