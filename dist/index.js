"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareCache = exports.build = exports.shouldServe = exports.version = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const os_1 = require("os");
const execa_1 = __importDefault(require("execa"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const path_1 = require("path");
const snake_case_1 = require("snake-case");
const build_utils_1 = require("@vercel/build-utils");
Object.defineProperty(exports, "shouldServe", { enumerable: true, get: function () { return build_utils_1.shouldServe; } });
const TMP = (0, os_1.tmpdir)();
// `chmod()` is required for usage with `vercel-dev-runtime`
// since file mode is not preserved in Vercel CLI deployments.
fs_extra_1.default.chmodSync((0, path_1.join)(__dirname, 'build.sh'), 0o755);
fs_extra_1.default.chmodSync((0, path_1.join)(__dirname, 'import.sh'), 0o755);
fs_extra_1.default.chmodSync((0, path_1.join)(__dirname, 'bootstrap'), 0o755);
const bootstrapPromise = build_utils_1.FileFsRef.fromFsPath({
    fsPath: (0, path_1.join)(__dirname, 'bootstrap'),
});
const runtimePromise = build_utils_1.FileFsRef.fromFsPath({
    fsPath: (0, path_1.join)(__dirname, 'runtime.sh'),
});
const importPromise = build_utils_1.FileFsRef.fromFsPath({
    fsPath: (0, path_1.join)(__dirname, 'import.sh'),
});
const curlPromise = (0, node_fetch_1.default)('https://github.com/dtschan/curl-static/releases/download/v7.63.0/curl').then(async (res) => {
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Failed to fetch "curl": ${err}`);
    }
    const data = await res.buffer();
    return new build_utils_1.FileBlob({ mode: 0o755, data });
});
const jqPromise = (0, node_fetch_1.default)('https://github.com/importpw/static-binaries/raw/master/binaries/linux/x86_64/jq').then(async (res) => {
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Failed to fetch "jq": ${err}`);
    }
    const data = await res.buffer();
    return new build_utils_1.FileBlob({ mode: 0o755, data });
});
// From this list: https://import.sh/docs/config
const allowedConfigImports = new Set([
    'CACHE',
    'CURL_OPTS',
    'DEBUG',
    'RELOAD',
    'SERVER',
]);
exports.version = 3;
const build = async ({ workPath, files, entrypoint, meta = {}, config = {}, }) => {
    await (0, build_utils_1.download)(files, workPath, meta);
    const { devCacheDir = (0, path_1.join)(workPath, '.vercel', 'cache') } = meta;
    const importCacheDir = (0, path_1.join)(devCacheDir, 'bash');
    const configEnv = {};
    for (const [key, val] of Object.entries(config)) {
        const name = (0, snake_case_1.snakeCase)(key).toUpperCase();
        if (typeof val === 'string' && allowedConfigImports.has(name)) {
            configEnv[`IMPORT_${name}`] = val;
        }
    }
    if (config === null || config === void 0 ? void 0 : config.import) {
        for (const key of Object.keys(config.import)) {
            const name = (0, snake_case_1.snakeCase)(key).toUpperCase();
            configEnv[`IMPORT_${name}`] = config.import[key];
        }
    }
    const IMPORT_TRACE = (0, path_1.join)(TMP, Math.random().toString(16).substring(2));
    const env = {
        ...process.env,
        ...configEnv,
        IMPORT_CACHE: importCacheDir,
        IMPORT_TRACE,
        WORK_PATH: workPath,
        ENTRYPOINT: entrypoint,
        BUILDER_DIST: __dirname,
    };
    const buildDir = await (0, build_utils_1.getWriteableDirectory)();
    await (0, execa_1.default)((0, path_1.join)(__dirname, 'build.sh'), [], {
        env,
        cwd: buildDir,
        stdio: 'inherit',
    });
    const trace = await fs_extra_1.default.readFile(IMPORT_TRACE, 'utf8').then((traceFile) => {
        const trimmed = traceFile.trim();
        if (!trimmed)
            return [];
        return trimmed.split('\n');
    });
    fs_extra_1.default.remove(IMPORT_TRACE);
    const lambdaFiles = {
        ...(await filesToBlobs((0, build_utils_1.glob)('**', buildDir)).finally(() => fs_extra_1.default.remove(buildDir))),
        bootstrap: await bootstrapPromise,
        '.import-cache/runtime.sh': await runtimePromise,
        '.import-cache/bin/import': await importPromise,
        '.import-cache/bin/curl': await curlPromise,
        '.import-cache/bin/jq': await jqPromise,
        // For now only the entrypoint file is copied into the lambda
        [entrypoint]: files[entrypoint],
    };
    for (const url of trace) {
        const urlPath = (0, path_1.normalize)(url.replace('://', '/'));
        const linkPath = (0, path_1.join)(importCacheDir, 'links', urlPath);
        const locationPath = (0, path_1.join)(importCacheDir, 'locations', urlPath);
        const [linkFile, locationFile] = await Promise.all([
            build_utils_1.FileFsRef.fromFsPath({ fsPath: linkPath }),
            build_utils_1.FileFsRef.fromFsPath({ fsPath: locationPath }),
        ]);
        lambdaFiles[(0, path_1.join)('.import-cache/links', urlPath)] = linkFile;
        lambdaFiles[(0, path_1.join)('.import-cache/locations', urlPath)] = locationFile;
        const dataPath = (0, path_1.join)((0, path_1.dirname)(linkPath), await fs_extra_1.default.readlink(linkPath));
        const dataOutputPath = (0, path_1.join)('.import-cache', (0, path_1.relative)(importCacheDir, dataPath));
        if (!lambdaFiles[dataOutputPath]) {
            lambdaFiles[dataOutputPath] = await build_utils_1.FileFsRef.fromFsPath({
                fsPath: dataPath,
            });
        }
    }
    // Trace the `bin` dir:
    //  - if symlink, then include if it points to a traced files
    //  - if not symlink, then always include in output
    const binDir = (0, path_1.join)(importCacheDir, 'bin');
    let bins = [];
    try {
        bins = await fs_extra_1.default.readdir(binDir);
    }
    catch (err) {
        if (err.code !== 'ENOENT')
            throw err;
    }
    for (const bin of bins) {
        const binPath = (0, path_1.join)(binDir, bin);
        const target = await fs_extra_1.default.readlink(binPath).catch((err) => {
            if (err.code !== 'EINVAL')
                throw err;
        });
        if (target) {
            const rel = (0, path_1.relative)(importCacheDir, (0, path_1.join)(binDir, target));
            if (!lambdaFiles[(0, path_1.join)('.import-cache', rel)]) {
                continue;
            }
        }
        lambdaFiles[(0, path_1.join)('.import-cache/bin', bin)] =
            await build_utils_1.FileFsRef.fromFsPath({
                fsPath: binPath,
            });
    }
    const output = new build_utils_1.Lambda({
        files: lambdaFiles,
        handler: entrypoint,
        runtime: 'provided',
        environment: configEnv,
    });
    return { output };
};
exports.build = build;
const prepareCache = async ({ workPath }) => {
    return await (0, build_utils_1.glob)('.vercel/cache/bash/**', workPath);
};
exports.prepareCache = prepareCache;
async function filesToBlobs(filesPromise) {
    const files = await filesPromise;
    for (const [name, file] of Object.entries(files)) {
        const stream = file.toStream();
        const buffer = await (0, build_utils_1.streamToBuffer)(stream);
        files[name] = new build_utils_1.FileBlob({
            mode: file.mode,
            contentType: file.contentType,
            data: buffer,
        });
    }
    return files;
}
//# sourceMappingURL=index.js.map