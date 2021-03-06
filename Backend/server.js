import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createFFmpeg } from '@ffmpeg/ffmpeg';



// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAiYuzGb7rNayD2mcLQp_3DasWftjQf8S4",
  authDomain: "third-project-a76e2.firebaseapp.com",
  databaseURL: "https://third-project-a76e2-default-rtdb.firebaseio.com",
  projectId: "third-project-a76e2",
  storageBucket: "third-project-a76e2.appspot.com",
  messagingSenderId: "858114061879",
  appId: "1:858114061879:web:b5470bb29d2df62dc8b1b2"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);



const ffmpegInstance = createFFmpeg({ log: true });
let ffmpegLoadingPromise = ffmpegInstance.load();

async function getFFmpeg() {
    if (ffmpegLoadingPromise) {
        await ffmpegLoadingPromise;
        ffmpegLoadingPromise = undefined;
    }

    return ffmpegInstance;
}

const app = express();
const port = 3000;
const upload = multer({
    // Puts data in a buffer rather than to disk
    storage: multer.memoryStorage(),
    // 100 mb size limit
    limits: { fileSize: 100 * 1024 * 1024 }
})

app.use(cors());

app.listen(port, () => {
    console.log('The express server is running.');
});

app.get('/', cors(),(req, res) => {
    console.log('Hello sent');
    res.send('Hello World!');
})

app.post('/uploadVideo', cors(), upload.single('video'), async (req, res) => {
    console.log('Request made');

    const file = req.file.buffer;

    const ffmpeg = await getFFmpeg();

    ffmpeg.FS('writeFile', 'lectureVideo', file);

    await ffmpeg.run(
        '-y', '-i', 'lectureVideo',
        '-preset', 'slow', '-g', '48', '-sc_threshold', '0',
        '-map', '0:0', '-map', '0:1', '-map', '0:0', '-map', '0:1',
        '-s:v:0', '640x360', '-c:v:0', 'libx264', '-b:v:0', '365k',
        '-s:v:1', '960x540', '-c:v:1', 'libx264', '-b:v:1', '2000k',
        '-c:a', 'copy',
        '-var_stream_map', 'v:0,a:0 v:1,a:1',
        '-master_pl_name', 'master.m3u8',
        '-f', 'hls', '-hls_time', '6', '-hls_list_size', '0',
        '-hls_segment_filename', 'v%v_fileSequence_%d.ts',
        'v%v_playlistVariant.m3u8'
    );

    ffmpeg.FS('unlink', 'lectureVideo');

    const master = ffmpeg.FS('readFile', 'master.m3u8');
    ffmpeg.FS('unlink', 'master.m3u8');
    const play0 = ffmpeg.FS('readFile', 'v0_playlistVariant.m3u8');
    ffmpeg.FS('unlink', 'v0_playlistVariant.m3u8');
    const play1 = ffmpeg.FS('readFile', 'v1_playlistVariant.m3u8');
    ffmpeg.FS('unlink', 'v1_playlistVariant.m3u8');
    const seq00 = ffmpeg.FS('readFile', 'v0_fileSequence_0.ts');
    ffmpeg.FS('unlink', 'v0_fileSequence_0.ts');
    const seq01 = ffmpeg.FS('readFile', 'v0_fileSequence_1.ts');
    ffmpeg.FS('unlink', 'v0_fileSequence_1.ts');
    const seq10 = ffmpeg.FS('readFile', 'v1_fileSequence_0.ts');
    ffmpeg.FS('unlink', 'v1_fileSequence_0.ts');
    const seq11 = ffmpeg.FS('readFile', 'v1_fileSequence_1.ts');
    ffmpeg.FS('unlink', 'v1_fileSequence_1.ts');

    const masterRef = ref(storage, 'test/master.m3u8');
    const play0Ref = ref(storage, 'test/v0_playlistVariant.m3u8');
    const play1Ref = ref(storage, 'test/v1_playlistVariant.m3u8');
    const seq00Ref = ref(storage, 'test/v0_fileSequence_0.ts');
    const seq01Ref = ref(storage, 'test/v0_fileSequence_1.ts');
    const seq10Ref = ref(storage, 'test/v1_fileSequence_0.ts');
    const seq11Ref = ref(storage, 'test/v1_fileSequence_1.ts');

    await uploadBytes(play0Ref, play0);

    await uploadBytes(play1Ref, play1);

    await uploadBytes(seq00Ref, seq00);

    await uploadBytes(seq01Ref, seq01);

    await uploadBytes(seq10Ref, seq10);

    await uploadBytes(seq11Ref, seq11);

    await uploadBytes(masterRef, master);

    await getDownloadURL(masterRef)
    .then(url => {
        res.status(200);
        res.send(url);
    });
});