const request = require("request");
const cheerio = require("cheerio");
const scoreCardObj = require("./scoreCard");

//it will extract html of fullLink page.
function getAllMatchLink(uri){
    request(uri, function(error, response, html){
        if (error) {
            console.log(error);
        } else {
            extractAllLink(html);
        }
    });
}

//This will extract scoreCard of matches
function extractAllLink(html){
    let $ = cheerio.load(html);
    let scoreCardArr = $('a[data-hover="Scorecard"]');
    
    for(let i = 0; i < scoreCardArr.length; i++){
        let link = $(scoreCardArr[i]).attr("href");
        let fullLink = "https://www.espncricinfo.com" + link;
        // console.log(fullLink);

        scoreCardObj.ps(fullLink);
    }

}


module.exports = {
    getAllMatch : getAllMatchLink
}