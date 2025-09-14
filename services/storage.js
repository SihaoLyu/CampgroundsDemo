const PROVIDER = process.env.STORAGE_PROVIDER || "local";
const multer = require("multer");
const AppError = require("../utils/appError");

let uploadImageParser;
let urlDerive;
let removeImages;

function setupLocal() {
    const { randomUUID } = require("crypto");
    const fs = require('fs/promises');
    const path = require('path');

    const localStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "public/uploadImage/");
        },
        filename: (req, file, cb) => {
            cb(null, `${randomUUID()}.${file.mimetype.split("/").pop()}`);
        }
    })

    const localImageRemoval = async fileNames => {
        const uploadDir = path.join(__dirname, '..', 'public', 'uploadImage');
        for (const fileName of fileNames) {
            try {
                await fs.unlink(path.join(uploadDir, fileName));
            } catch (error) {
                if (error.code !== 'ENOENT') throw new AppError("Remove images error", 500);
            }
        }
    }

    uploadImageParser = multer({ storage: localStorage });
    urlDerive = f => `/uploadImage/${f.filename}`;
    removeImages = localImageRemoval;
}

function setupCloud() {
    const cloudinary = require("cloudinary").v2;
    const { createCloudinaryStorage } = require("./cloudinary");

    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET
    });

    const cloudinaryStorage = createCloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: "campgroundDemo",
            format: "jpg",
            allowed_formats: ["jpg", "jpeg", "png"]
        }
    });

    const cloudImageRemoval = async fileNames => {
        await Promise.all(fileNames.map(async fileName => {
            try {
                const destroyResult = await cloudinary.uploader.destroy(f, { invalidate: true });
                if (destroyResult.result !== 'ok' && destroyResult.result !== 'not found') {
                    throw new Error(`destroy failed: ${destroyResult.result || 'unknown'}`);
                }
            } catch (error) {
                throw new AppError("Remove images error", 500);
            }
        }));
    };

    uploadImageParser = multer({ storage: cloudinaryStorage });
    urlDerive = f => f.url || f.path;
    removeImages = cloudImageRemoval;
}

if (PROVIDER === "local") {
    setupLocal();
} else if (PROVIDER === "cloud") {
    setupCloud();
} else {
    throw new AppError(`Invalid STORAGE_PROVIDER: ${PROVIDER}`, 500);
}

module.exports = { uploadImageParser, urlDerive, removeImages };