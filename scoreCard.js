const request = require("request");
const cheerio = require("cheerio");
const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");

function processScoreCard(url){
    request(url, cb);
}

// const url = 'https://www.espncricinfo.com/series/ipl-2020-21-1210595/mumbai-indians-vs-chennai-super-kings-1st-match-1216492/full-scorecard'

// request(url, cb);

function cb(error, response, html) {
    if (error) {
        console.log(error);
    } else {
       extractMatchDetails(html);
    }
}

function extractMatchDetails(html){
    let $ = cheerio.load(html);
    let descString = $('.header-info .description');
    // console.log(descString.text());

    let descStringArr = descString.text().split(',');
    // console.log(descStringArr);

    let venue = descStringArr[1].trim();
    let date = descStringArr[2].trim();
    let result = $('.match-info.match-info-MATCH.match-info-MATCH-half-width .status-text').text();
    
    console.log(venue);
    console.log(date);
    console.log(result);

    //MI aur csk ki tables ka content aa gaya hai innings mein
    let innings = $('.card.content-block.match-scorecard-table>.Collapsible');
    
    //aise bhi html print kar sakte hai
    // let innings = $('.card.content-block.match-scorecard-table>.Collapsible').html();
    // console.log(innings);

    let htmlString = " ";

    for(let i = 0; i < innings.length; i++){
        htmlString += $(innings[i]).html(); //isme data html mein convert ho raha hai

        //find mein element pass karege jo nikalna hai
        let teamName = $(innings[i]).find('h5').text();
        teamName = teamName.split('INNINGS')[0].trim();
        let opponentIdx = (i == 0 ? 1 : 0);
        let opponentName = $(innings[opponentIdx]).find('h5').text();
        opponentName = opponentName.split('INNINGS')[0].trim();
        // console.log(teamName, "v/s" ,opponentName);

        let cInning = $(innings[i])
        let allRows = cInning.find('.table.batsman tbody tr');

        //This is to get batsman name and to omit the commentry in the same table row
        for(let j = 0; j < allRows.length; j++){
            let allCols = $(allRows[j]).find('td');
            let isWorthy = $(allCols[0]).hasClass('batsman-cell');
            //hasClass returns T/F. and idhar '.' lagane ki zarorat nhi hai

            if(isWorthy == true){
                let playerName = $(allCols[0]).text().trim();
                let runs = $(allCols[2]).text().trim();
                let balls = $(allCols[3]).text().trim();
                let fours = $(allCols[5]).text().trim();
                let sixes = $(allCols[6]).text().trim();
                let strikeRates = $(allCols[7]).text().trim();

                console.log(`${playerName} | ${runs} | ${balls} | ${fours} | ${sixes} | ${strikeRates}`);

                processPlayer(teamName, opponentName, playerName, runs, balls, fours, sixes, strikeRates, venue, date, result);
            }
        }
        console.log("-------------------------------------");     
    }

    // console.log(htmlString);
    //idhar jo html aayegi usse new html file mein copy karke paste kar denge(innings.html)

}


function processPlayer(teamName, opponentName, playerName, runs, balls, fours, sixes, strikeRates, venue, date, result){
    let teamPath = path.join(__dirname, "IPL", teamName);
    dirCreator(teamPath);
    let filePath = path.join(teamPath, playerName + '.xlsx');

    let content = excelReader(filePath, playerName); //[]
    
    let playerObj = {
        teamName, 
        opponentName, 
        playerName, 
        runs, 
        balls, 
        fours, 
        sixes, 
        strikeRates, 
        venue, 
        date, 
        result
    };

    content.push(playerObj);
    excelWriter(filePath, playerName, content);
}

function dirCreator(filePath){
    if(fs.existsSync(filePath) == false){
        fs.mkdirSync(filePath);
    }
}

function excelWriter(fileName, sheetName, jsonData){
    //Creating a new Workbook
    let newWB = xlsx.utils.book_new();
  
    // json is converted to sheet format(rows and cols)
    let newWS = xlsx.utils.json_to_sheet(jsonData);
  
    xlsx.utils.book_append_sheet(newWB, newWS,sheetName);
    xlsx.writeFile(newWB,fileName);
}
  
function excelReader(fileName, sheetName){
    if(fs.existsSync(fileName) == false){
        return [];
    }

    let wb = xlsx.readFile(fileName);
    let excelData = wb.Sheets[sheetName];
    let ans = xlsx.utils.sheet_to_json(excelData);
    return ans;
}

module.exports = {
    ps : processScoreCard,
}

