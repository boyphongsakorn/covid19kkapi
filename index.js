const fetch = require('node-fetch')
const cheerio = require('cheerio')
const express = require('express')
var fs = require('fs')
const cron = require("cron");

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

let scheduledMessage = new cron.CronJob('*/5 * * * * *', () => {

    let dataarray = []
    let comfirmdataarray = []

    fetch('https://covid19.kkpho.go.th/situation/page-trans.php')
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
            });*/
            console.log(dataarray)
            //console.log(dataarray[0][0])
            console.log(datetextandtime())

            //JSON.stringify(dataarray)

            var fileContents = null;
            try {
                fileContents = fs.readFileSync('check.txt');
            } catch (err) {

            }

            if (fileContents && JSON.Parse(fileContents) != dataarray) {
                if (dataarray != [['เมืองขอนแก่น', '0'], ['บ้านฝาง', '0'], ['พระยืน', '0'], ['หนองเรือ', '0'], ['ชุมแพ', '0'], ['สีชมพู', '0'], ['น้ำพอง', '0'], ['อุบลรัตน์', '0'], ['กระนวน', '0'], ['บ้านไผ่', '0'], ['เปือยน้อย', '0'], ['พล', '0'], ['แวงใหญ่', '0'], ['แวงน้อย', '0'], ['หนองสองห้อง', '0'], ['ภูเวียง', '0'], ['มัญจาคีรี', '0'], ['ชนบท', '0'], ['เขาสวนกวาง', '0'], ['ภูผาม่าน', '0'], ['ซำสูง', '0'], ['โคกโพธิ์ไชย', '0'], ['หนองนาคำ', '0'], ['บ้านแฮด', '0'], ['โนนศิลา', '0'], ['เวียงเก่า', '0'], ['ต่างจังหวัด', '0']]) {
                    dataarray.forEach(element => {
                        if (element[1] != '0') {
                            if (element[1] > dataarray[0][1]) {
                                comfirmdataarray.unshift([element[0], element[1]])
                            } else {
                                comfirmdataarray.push([element[0], element[1]])
                            }
                        }
                    });
                    console.log('false')
                    let textnow = 'ผู้ติดเชื้อยืนยันวันนี้ของจังหวัดขอนแก่น '+ datetextandtime() + "\n"
                    comfirmdataarray.forEach(element => {
                        text += element[0] + "+" + element[1]
                    });
                    var myHeaders = new Headers();
                    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
                    myHeaders.append("Authorization", "Bearer U2J3SOyoJgWp9qRZ6JTG6ngRgCfuqgpcivzblZw1fyB");

                    var requestOptions = {
                        method: 'POST',
                        headers: myHeaders,
                        redirect: 'follow'
                    };

                    fetch("https://notify-api.line.me/api/notify?message=" + textnow + "&notificationDisabled=true", requestOptions)
                        .then(response => response.text())
                        .then(result => console.log(result))
                        .catch(error => console.log('error', error));
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