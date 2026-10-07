import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({});

const RECORDINGS_BUCKET = process.env.RECORDINGS_BUCKET;
const PRESIGN_EXPIRES_SECONDS = 300;
const ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;

const CONTENT_TYPE_EXTENSIONS = {
  "audio/webm": "webm",
  "audio/mp4": "m4a",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/ogg": "ogg",
};

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

export const handler = async (event) => {
  const params = event.queryStringParameters || {};
  const speakerId = (params.speakerId || "").toLowerCase();
  const wordId = (params.wordId || "").toLowerCase();
  const contentType = params.contentType || "";

  if (!ID_PATTERN.test(speakerId)) {
    console.log("rejected: invalid speakerId", { speakerId });
    return jsonResponse(400, { error: "invalid speakerId" });
  }

  if (!ID_PATTERN.test(wordId)) {
    console.log("rejected: invalid wordId", { wordId });
    return jsonResponse(400, { error: "invalid wordId" });
  }

  const extension = CONTENT_TYPE_EXTENSIONS[contentType];
  if (!extension) {
    console.log("rejected: invalid contentType", { contentType });
    return jsonResponse(400, { error: "invalid contentType" });
  }

  const key = `uploads/${speakerId}/${wordId}-${Date.now()}.${extension}`;

  try {
    const command = new PutObjectCommand({
      Bucket: RECORDINGS_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3, command, {
      expiresIn: PRESIGN_EXPIRES_SECONDS,
    });

    console.log("presigned upload issued", { key });
    return jsonResponse(200, { url, key });
  } catch (error) {
    console.error("failed to presign upload", error);
    return jsonResponse(400, { error: "failed to presign upload" });
  }
};
