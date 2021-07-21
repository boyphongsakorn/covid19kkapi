const fetch = require('node-fetch')
//const fetch = require('node-fetch-with-proxy');
const cheerio = require('cheerio')
const express = require('express')
var https = require('follow-redirects').https;
var fs = require('fs')
const cron = require("cron");
const HttpsProxyAgent = require('https-proxy-agent');

require('dotenv').config()

//process.env['HTTP_PROXY'] = 'http://183.89.156.11:8080'

function random_item(items){
    return items[Math.floor(Math.random()*items.length)];    
}

function arr_diff(a1, a2) {

    var a = [], diff = [];

    for (var i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
    }

    for (var i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        } else {
            a[a2[i]] = true;
        }
    }

    for (var k in a) {
        diff.push(k);
    }

    return diff;
}

function padLeadingZeros(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

function convertmonthtotext(month) {
    switch (month) {
        case '01': return "มกราคม"; break;
        case '02': return "กุมภาพันธ์"; break;
        case '03': return "มีนาคม"; break;
        case '04': return "เมษายน"; break;
        case '05': return "พฤษภาคม"; break;
        case '06': return "มิถุนายน"; break;
        case '07': return "กรกฎาคม"; break;
        case '08': return "สิงหาคม"; break;
        case '09': return "กันยายน"; break;
        case '10': return "ตุลาคม"; break;
        case '11': return "พฤศจิกายน"; break;
        case '12': return "ธันวาคม"; break;
    }
}

function datetextandtime() {
    let date_ob = new Date();

    // current date
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();

    // current hours
    let hours = date_ob.getHours();

    // current minutes
    let minutes = date_ob.getMinutes();

    // current seconds
    let seconds = date_ob.getSeconds();

    //console.log(year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
    //console.log(date + " " + convertmonthtotext(month) + " " + (year + 543) + " " + hours + ":" + minutes + ":" + seconds)

    return "วันที่ " + padLeadingZeros(date, 2) + " " + convertmonthtotext(month) + " " + (year + 543) + " เวลา " + padLeadingZeros(hours, 2) + ":" + padLeadingZeros(minutes, 2) + ":" + padLeadingZeros(seconds, 2)
}

const app = express()
const port = process.env.PORT || 3000;
let proxylist = ['202.62.111.171:8080', '24.172.34.114:49920', '203.192.217.11:8080', '118.70.12.171:53281', '45.70.14.226:999'];

let scheduledMessage = new cron.CronJob('*/60 * * * * *', () => {

    let dataarray = [];
    let comfirmdataarray = [];

    fetch('https://www.proxy-list.download/api/v1/get?type=https')
    .then(res => res.text())
    .then((body) => {
        console.log(body.split("\r\n"))
        proxylist = body.split("\r\n")
        proxylist.pop()
        console.log(proxylist)
    })

    const proxyAgent = new HttpsProxyAgent("http://"+random_item(proxylist));
    console.log(proxyAgent)
    fetch('https://covid19.kkpho.go.th/situation/page-trans.php',{timeout: 60000,agent: proxyAgent})
    //fetch('https://covid19.kkpho.go.th/situation/page-trans.php')
        .then(res => res.text())
        .then((body) => {
            
            let $ = cheerio.load(body)
            for (let index = 1; index < 108; index = index + 4) {
                //const element = array[index];
                dataarray.push([$('td').toArray()[index].firstChild.data, $('td').toArray()[index + 1].firstChild.data])
                //console.log(dataarray)
            }
            /*$('td').toArray().forEach(element => {
                //console.log(element.firstChild.data)
            });
            console.log(dataarray)
            //console.log(dataarray[0][0])
            console.log(datetextandtime())*/

            //JSON.stringify(dataarray)

            var fileContents = null;
            try {
                fileContents = fs.readFileSync('array.txt', { encoding: 'utf8', flag: 'r' });
            } catch (err) {

            }

            let nowconfirm = 0

            if (fileContents) {
                //console.log(fileContents)
                if (arr_diff(JSON.parse(fileContents), dataarray).length != 0) {
                    let arrdiff = arr_diff(JSON.parse(fileContents), dataarray)
                    if (dataarray != [['เมืองขอนแก่น', '0'], ['บ้านฝาง', '0'], ['พระยืน', '0'], ['หนองเรือ', '0'], ['ชุมแพ', '0'], ['สีชมพู', '0'], ['น้ำพอง', '0'], ['อุบลรัตน์', '0'], ['กระนวน', '0'], ['บ้านไผ่', '0'], ['เปือยน้อย', '0'], ['พล', '0'], ['แวงใหญ่', '0'], ['แวงน้อย', '0'], ['หนองสองห้อง', '0'], ['ภูเวียง', '0'], ['มัญจาคีรี', '0'], ['ชนบท', '0'], ['เขาสวนกวาง', '0'], ['ภูผาม่าน', '0'], ['ซำสูง', '0'], ['โคกโพธิ์ไชย', '0'], ['หนองนาคำ', '0'], ['บ้านแฮด', '0'], ['โนนศิลา', '0'], ['เวียงเก่า', '0'], ['ต่างจังหวัด', '0']]) {
                        dataarray.forEach(element => {
                            if (element[1] != '0') {
                                if(comfirmdataarray.length != 0){
                                    if (parseInt(element[1]) >= parseInt(comfirmdataarray[0][1])) {
                                        comfirmdataarray.unshift([element[0], element[1]])
                                    }else{
                                        comfirmdataarray.push([element[0], element[1]])
                                    }
                                }else{
                                    comfirmdataarray.push([element[0], element[1]])
                                }
                                nowconfirm += parseInt(element[1])
                            }
                        });
                        console.log('false')
                        let textnow = 'ผู้ติดเชื้อยืนยันวันนี้ของจังหวัดขอนแก่น ' + datetextandtime() + " รวมทั้งหมด " + nowconfirm + " ราย แยกดังต่อไปนี้ \n"
                        comfirmdataarray.forEach(element => {
                            textnow += element[0] + "+" + element[1]
                            arrdiff.forEach(function (value, i) {
                                console.log(i + ": " + value)
                                /*if(value[0] == element[0]){
                                    if(parseInt(element[1])-parseInt(value[1]) > 0){
                                        textnow += "(เพิ่มขึ้นจากยอดที่อัพเดทก่อนหน้านี้ " + parseInt(element[1])-parseInt(value[1]) + " ราย)"
                                    }else{
                                        textnow += "(ลดลงจากยอดที่อัพเดทก่อนหน้านี้ " + parseInt(element[1])-parseInt(value[1]) + " ราย)"
                                    }
                                    array.splice(i, 1)
                                }*/
                            })
                            textnow += "\n"
                        });
                        textnow = textnow.slice(0, -1)
                        var options = {
                            'method': 'POST',
                            'hostname': 'notify-api.line.me',
                            'path': '/api/notify?message='+encodeURI(textnow),
                            //'path': '/api/notify?message='+encodeURI(textnow)+'&notificationDisabled=true',
                            'headers': {
                                'Content-Type': 'application/x-www-form-urlencoded',
                                'Authorization': 'Bearer '+process.env.LINETOKEN
                            },
                            'maxRedirects': 20
                        };

                        var req = https.request(options, function (res) {
                            var chunks = [];

                            res.on("data", function (chunk) {
                                chunks.push(chunk);
                            });

                            res.on("end", function (chunk) {
                                var body = Buffer.concat(chunks);
                                console.log(body.toString());
                            });

                            res.on("error", function (error) {
                                console.error(error);
                            });
                        });

                        req.end();
                    }
                }
            } else {
                console.log('ยังไม่มีการเปลี่ยนแปลง')
            }

            fs.writeFile('array.txt', JSON.stringify(dataarray), function (err) {
                if (err) {
                    throw err
                };
                console.log('Saved!');
            });
            //U2J3SOyoJgWp9qRZ6JTG6ngRgCfuqgpcivzblZw1fyB
        })

})

// When you want to start it, use:
scheduledMessage.start()
// You could also make a command to pause and resume the job