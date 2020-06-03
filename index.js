const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs')
const parse = require('csv-parse')
const getStream = require('get-stream');
const readCSVData = async filePath => (await getStream.array(fs.createReadStream(filePath).pipe(parse({ delimiter: ',' }))))

async function main() {
    let res = []
    for (let [id, pinyin, verified, startTime, endTime] of (await readCSVData('./original/HowHow 發音標註眾包 - 發音表.csv'))) {
        id = Number(id)
        res.push({ id, pinyin, verified: verified == 'v', startTime, endTime })
    }
    console.log('csv 檔案解析完成')
    console.log('ffmpeg 處理中...')
    for (let { pinyin, startTime, endTime } of res) {
        ffmpeg('./original/howhow.mp3')
            .setStartTime(startTime)
            .setDuration(endTime - startTime)
            .output(`./result/mp3/${pinyin}.mp3`)
            .on('error', err => console.log('error: ', pinyin, err))
            .run();
    }
    for (let { pinyin, startTime, endTime } of res) {
        ffmpeg('./original/howhow.mp4')
            .setStartTime(startTime)
            .setDuration(endTime - startTime)
            .output(`./result/mp4/${pinyin}.mp4`)
            .on('error', err => console.log('error: ', pinyin, err))
            .run();
    }
}
main() 