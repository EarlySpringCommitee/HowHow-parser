const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs')
const parse = require('csv-parse')
const getStream = require('get-stream');
const readCSVData = async filePath => (await getStream.array(fs.createReadStream(filePath).pipe(parse({ delimiter: ',' }))))

async function main() {
    let res = []
    for (let [pinyin, startTime, endTime] of (await readCSVData('./original/HowHow 發音標註眾包 - 發音表.csv'))) {
        startTime = parseFloat(startTime) + 0.1
        endTime = parseFloat(endTime) - 0.1
        pinyin = pinyin == '' ? `沒有拼音 - ${Math.random().toString(36).substring(7)}` : pinyin
        if (pinyin.length > 30)
            pinyin = pinyin.slice(0, 30)
        res.push({ pinyin, startTime, endTime })
    }
    res.shift();
    console.log('csv 檔案解析完成')
    //create folder
    function rmdir(d) {
        let self = arguments.callee
        if (fs.existsSync(d)) {
            fs.readdirSync(d).forEach(file => {
                let C = d + '/' + file
                if (fs.statSync(C).isDirectory()) self(C)
                else fs.unlinkSync(C)
            })
            fs.rmdirSync(d)
        }
    }
    rmdir('./result');
    for (let folder of ['./result',]) {
        fs.mkdirSync(folder);
        for (let folder2 of ['/mp3/', '/mp4/']) {
            fs.mkdirSync(folder + folder2);
            for (let folder3 of [1, 2]) {
                fs.mkdirSync(folder + folder2 + folder3);
            }
        }
    }
    console.log('ffmpeg 處理中...')
    let counter
    counter = 0
    for (let { pinyin, startTime, endTime } of res) {
        counter++
        ffmpeg('./original/howhow.mp3')
            .setStartTime(startTime)
            .setDuration(endTime - startTime)
            //.output(`./result/mp3/${1}/${id}-${pinyin}.mp3`)
            .output(`./result/mp3/${Math.ceil(counter / 1000)}/${pinyin}.mp3`)
            .on('error', err => console.log('error: ', pinyin, err))
            .run();
    }
    counter = 0
    for (let { pinyin, startTime, endTime } of res) {
        counter++
        ffmpeg('./original/howhow.mp4')
            .setStartTime(startTime)
            .setDuration(endTime - startTime)
            .output(`./result/mp4/${Math.ceil(counter / 1000)}/${pinyin}.mp4`)
            .on('error', err => console.log('error: ', pinyin, err))
            .run();
    }
}
main() 