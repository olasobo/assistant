const fs = require('fs');
const router = require('express').Router();
const multer = require('multer');
const upload = multer();
const speech = require('../speech');
const ffmpeg = require('fluent-ffmpeg');
const Readable = require('stream').Readable;
const request = require('request-promise');

const MASHAPE_URL = 'https://webknox-question-answering.p.mashape.com/questions/answers?answerLookup=true&answerSearch=true';

const getAnswerURL = question => `${MASHAPE_URL}&question=${encodeURIComponent(question)}`;

function bufferToStream(buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

router.get('/', (req, res) =>
  res.json({ message: 'Hello' })
);

const recognizeSpeech = (req, res, next) => {
  fs.writeFileSync('./temp', req.file.buffer);
  const flacStream = ffmpeg('./temp').format('flac').audioChannels(1);
  const googleStream = speech.streamingRecognize({
    config: {
      encoding: 'FLAC',
      languageCode: 'en-us',
      sampleRateHertz: 44100,
    },
  });
  googleStream.on('data', response => {
    req.speechGuess = response;
  })
  .on('error', err => next(err))
  .on('finish', () => next());
  flacStream.pipe(googleStream);
};

const answerQuestion = async (req, res, next) => {
  if (req.speechGuess && req.speechGuess.results) {
    const transcript = req.speechGuess.results[0].alternatives[0].transcript;
    const mashapeResponse = await request({
      json: true,
      url: getAnswerURL(transcript),
      headers: {
        'X-Mashape-Key': process.env.MASHAPE_KEY,
      },
    });
    return res.json(mashapeResponse);
  }
  return next(new Error('There was an error'));
};

router.post('/', upload.single('audio'), recognizeSpeech, answerQuestion);

module.exports = router;
