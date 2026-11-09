import { Storage } from "@google-cloud/storage";

const OBJECT_NAME = /^resumes\/[0-9a-f-]{36}\.(pdf|doc|docx)$/;

let storage;

function client() {
  storage ??= new Storage();
  return storage;
}

export function isCloudResume(storedName) {
  return OBJECT_NAME.test(storedName);
}

export async function saveResume(bucketName, objectName, buffer, contentType) {
  await client().bucket(bucketName).file(objectName).save(buffer, {
    contentType,
    resumable: false,
    metadata: { cacheControl: "private, max-age=0" },
  });
}

export async function openResume(bucketName, objectName) {
  if (!isCloudResume(objectName)) return null;
  const file = client().bucket(bucketName).file(objectName);
  const [exists] = await file.exists();
  if (!exists) return null;
  return file.createReadStream();
}

export async function deleteResume(bucketName, objectName) {
  if (!isCloudResume(objectName)) return;
  await client()
    .bucket(bucketName)
    .file(objectName)
    .delete({ ignoreNotFound: true });
}
