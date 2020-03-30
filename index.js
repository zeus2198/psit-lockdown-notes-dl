// @author: Simran Singh (simran.singh2198@gmail.com)

var axios = require('axios');
var qs = require('qs');
var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');
var path = require('path');
var async = require('async');

const BASE_URL = "https://erp.psit.in";

const BASE_PATH = path.join(__dirname, 'downloads');
const PARALLEL_FILE_LIMIT = 3; // no. of files to be downloaded at one time in paralell

const username = "18164102**";
const password = "****";

const subjectCodeMap = {
    'KAS-402': 'Maths',
    'KCS-401': 'OS',
    'KCS-402': 'Automata',
    'KCS-403': 'Microprocessor',
    'KNC-401': 'Cyber Security',
    'KVE-401': 'Human Values'
};

const psitInstance = axios.create({ baseURL: BASE_URL });

var c = 1;
function startSession(instance) {
    return new Promise((resolve, reject) => {
        axios.post(BASE_URL).then((resp) => {
            const cookie = resp.headers["set-cookie"][0];
            instance.defaults.headers.Cookie = cookie;
            resolve();
            console.log("Got session cookie");
            // console.log(cookie);
            // console.log(resp.headers);
        }).catch(e => reject(e));
    });
}

function login(instance) {
    return new Promise((resolve, reject) => {
        instance({
            method: 'post',
            url: BASE_URL + '/Erp/Auth',
            data: qs.stringify({ username, password }),
            headers: {
                'Access-Control-Allow-Origin': '*',
                "User-Agent": " Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:74.0) Gecko/20100101 Firefox/74.0",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "gzip, deflate, br",
                "Content-Type": "application/x-www-form-urlencoded",
            }

        }).then((resp) => {
            resolve();
            console.log("Login done");
            // console.log(resp.headers);
        }).catch(e => reject(e));
    });
}

function getNotesList(html) {
    // return format = [ { name:'', url:''}, ...]
    const $ = cheerio.load(html);
    var notesList = [];
    $("#data-table tbody tr").each(function (i, elem) {
        notesList.push({});
        var htmlList = $(elem).find('td');
        notesList[i].subject = $(htmlList[2]).text();
        notesList[i].name = $(htmlList[3]).text();
        notesList[i].url = $(htmlList[4]).find("a").attr("href");
    });
    // console.log(notesList);
    return notesList;
}
var download = function (url, dest, callback) {
    fs.stat(dest, async function (err, stat) {
        if (err == null) {
            console.log("Already exists, skipping:", dest);
            c++;
            return callback();
        }
        await fs.promises.mkdir(path.dirname(dest), { recursive: true }).catch(console.error);
        request.get(url)
            .on('error', function (err) { callback(err) })
            .pipe(fs.createWriteStream(dest))
            .on('close', () => {
                console.log("Completed: ", dest);
                c++;
                callback();
            });
    });

}
function downloadList(list) {
    async.eachLimit(list, PARALLEL_FILE_LIMIT, function (file, cb) {
        if (file.name.substring(file.name.length - 8, file.name.length - 4) != "2020") // checking if file is of correct format
            return cb();

        if (!(file.subject in subjectCodeMap)) {
            console.log("Error: Subject code", file.subject, "is not in subjectCodeMap therefore all files for this subject will be skipped");
            return cb();
        }
        console.log("Downloading", file.name);
        download(file.url,
            path.join(BASE_PATH,
                subjectCodeMap[file.subject],
                `${file.name.substring(file.name.length - 2)}-${file.name.substring(file.name.length - 4, file.name.length - 2)}-${file.name.substring(file.name.length - 8, file.name.length - 4)}.${file.url.split('.').pop()}`
            ),
            cb
        );

    }, function (err) {
        if (err != null) console.log("Some error occured", err);
        console.log("Total Files Processed for downloading: ", c);
    });

}
startSession(psitInstance).then(() => login(psitInstance)).then(() => {
    psitInstance.get(BASE_URL + "/Student/NotesList").then(res => {
        if(res.data.length == 0)
            return console.log("ERROR: Login failed, wrong username or password?");
        var notesList = getNotesList(res.data);
        downloadList(notesList);
    })
}).catch(e =>
    console.log("Error", e)
);