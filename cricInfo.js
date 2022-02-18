const url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";
const request = require("request");
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const allMatchObj = require("./allMatch");

request(url, cb);

//response use ho ya nhi ho .. hume callBack function mein response likhna hota hai kyuki request module ki complusion hai yeh 3 parameters. Agar response hatta denge toh html nhi milega.
function cb(error, response, html) {
    if (error) {
        console.log(error);
    } else {
        extractLink(html);
        // console.log(html);
    }
}

//it will extract 'view all results' page link.
function extractLink(html) {
    let $ = cheerio.load(html); //$ - selector Tool
    let anchorElement = $('a[data-hover = "View All Results"]'); //[] isliye kyuki attribute selector

    //this will give href attribute ki value. iss website mein aadha link de rakha kyuki browser apne aap pura bana dega.
    let link = anchorElement.attr("href");
    // console.log(link);

    let fullLink = "https://www.espncricinfo.com" + link;
    // console.log(fullLink);

    allMatchObj.getAllMatch(fullLink);
}

//__dirname - jo current directory uska path leke aata hai
//iske aage IPL add kar denge toh ek naya folder ban jayega IPL naam ka
let iplPath = path.join(__dirname, "IPL");

function dirCreator(filePath){
    if(fs.existsSync(filePath) == false){
        fs.mkdirSync(filePath);
    }
}

dirCreator(iplPath);


