class CloudinaryStorage {
    constructor(opts) {
        if (!opts || !opts.cloudinary) {
            throw new Error('cloudinary instance required', 400);
        }
        this.cloudinary = opts.cloudinary;
        this.params = opts.params || {};
    }

    async _handleFile(req, file, cb) {
        try {
            const uploadOptions = await resolveParams(this.params, req, file);
            const resp = await this._upload(uploadOptions, file);
            cb(null, {
                path: resp.secure_url,
                url: resp.secure_url,
                filename: resp.public_id,
                public_id: resp.public_id,
                size: resp.bytes,
                format: resp.format,
                width: resp.width,
                height: resp.height
            });
        } catch (err) {
            cb(err);
        }
    }

    _removeFile(req, file, cb) {
        const id = file?.filename || file?.public_id;
        if (!id) return cb && cb();
        this.cloudinary.uploader
            .destroy(id, { invalidate: true })
            .then(() => cb && cb())
            .catch((err) => cb && cb(err));
    }

    _upload(opts, file) {
        return new Promise((resolve, reject) => {
            const stream = this.cloudinary.uploader.upload_stream(
                opts,
                (err, res) => (err ? reject(err) : resolve(res))
            );
            file.stream.on('error', reject);
            file.stream.pipe(stream);
        });
    }
}

async function resolveParams(params, req, file) {
    if (typeof params === 'function') {
        const resolvedParams = await params(req, file);
        return withDefaults(resolvedParams);
    }
    const out = {};
    const { public_id, ...rest } = params || {};
    if (typeof public_id === 'function') out.public_id = await public_id(req, file);
    else if (public_id != null) out.public_id = public_id;

    for (const k of Object.keys(rest)) {
        const val = rest[k];
        out[k] = typeof val === 'function' ? await val(req, file) : val;
    }
    return withDefaults(out);
}

function withDefaults(opts) {
    return { resource_type: 'auto', ...opts };
}

function createCloudinaryStorage(opts) {
    return new CloudinaryStorage(opts);
}

module.exports = { CloudinaryStorage, createCloudinaryStorage };
