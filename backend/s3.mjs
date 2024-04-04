import {
    GetObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from "uuid";
import mongoose from "mongoose";
import Urls from "./models/urlModel.mjs";

const s3 = new S3Client();
const BUCKET = process.env.BUCKET;
const REGION = process.env.REGION;

console.log("REGION=" + REGION);

//mongodb connection----------------------------------------------
const mongoUrl = process.env.MONGODB_URL;
console.log("mongoUrl=" + mongoUrl);

mongoose
    .connect(mongoUrl, {
        useNewUrlParser: true,
    })
    .then(() => {
        console.log("Connected to database");
    })
    .catch((e) => console.log(e));

export const uploadToS3 = async ({ file, userId }) => {
    // const key = `${userId}/${uuid()}`;
    const key = `${userId}/${uuid()}-${file.originalname}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    try {
        await s3.send(command);

        console.log("<<<>>>");
        console.log(key);
        const curr_url = 'https://' + BUCKET + '.s3.amazonaws.com/' + key;
        console.log(curr_url);
        console.log("<<<>>>");

        try {
            await Urls.create({ photoUrl: curr_url });
        } catch (error) {
            console.log(error);
            return { error };
        }

        return { key };
    } catch (error) {
        console.log(error);
        return { error };
    }

};

const getImageKeysByUser = async (userId) => {
    const command = new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: userId,
    });

    const { Contents = [] } = await s3.send(command);

    return Contents.sort(
        (a, b) => new Date(b.LastModified) - new Date(a.LastModified)
    ).map((image) => image.Key);
};

export const getUserPresignedUrls = async (userId) => {
    try {
        const imageKeys = await getImageKeysByUser(userId);

        const presignedUrls = await Promise.all(
            imageKeys.map((key) => {
                const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });

                return getSignedUrl(s3, command, { expiresIn: 900 }); // default
            })
        );
        return { presignedUrls };
    } catch (error) {
        console.log(error);
        return { error };
    }
};