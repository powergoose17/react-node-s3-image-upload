import "dotenv/config";
import express, { json } from "express";
import cors from "cors";
import multer, { memoryStorage } from "multer";
import { getUserPresignedUrls, uploadToS3 } from "./s3.mjs";

const app = express();

const BUCKET = process.env.BUCKET;
const PORT = process.env.PORT;

const storage = memoryStorage();
const upload = multer({ storage });

app.use(
  cors({
    origin: "*",
  })
);
app.use(json());

app.post("/images", upload.single("image"), (req, res) => {
  const { file } = req;
  const userId = req.headers["x-user-id"];

  console.log('<<<');
  console.log(file);
  console.log(`UserId:filename:: ${userId}::${file.originalname}`);
  console.log('<<<');
  if (!file || !userId) return res.status(400).json({ message: "Bad request" });

  const { error, key } = uploadToS3({ file, userId });
  if (error) return res.status(500).json({ message: error.message });

  return res.status(201).json({ key });
});

app.get("/images", async (req, res) => {
  const userId = req.headers["x-user-id"];

  console.log('||| in get /images: ');
  console.log('userID: ', userId);
  console.log(req.headers);
  console.log('REQREQREQ');

  if (!userId) return res.status(400).json({ message: "Bad request" });

  const { error, presignedUrls } = await getUserPresignedUrls(userId);
  if (error) return res.status(400).json({ message: error.message + ':getUserPresignedUrls' });

  console.log(presignedUrls);
  console.log('|||');

  return res.json(presignedUrls);
});

app.listen(PORT, () => {
  console.log(`Server listening on port::: ${PORT} for ${BUCKET}`);
});