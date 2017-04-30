/*
 *@author Crowphy
 *爬虫 获取一个站点所有指定的相关内容
*/
const url = require('url');
      superagent = require('superagent'),
      cheerio = require('cheerio'),
      fs = require('fs'),
      readline = require('readline');

const readEntry = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const links = {};
let count = 0;
const questions = ['请输入入口 url:', '请输入您要过滤的链接正则表达式内容(形如:/您输入的内容/):', '请输入要匹配的内容正则表达式(形如:/您输入的内容/):'];
const answers = [];
let index = 0;


const handleRequest = (entryUrl) => {

    // const path = req.url;
    // const queryParams = url.parse(path, true).query;
    // const callback = queryParams.callback;
    
    superagent
        .get(entryUrl)
        .timeout({
            response: 3000,
            deadline: 10000
        })
        .end(function(err, result) {

            if(err) {
                if(err.timeout) {
                    console.log(count, 'timeout:', entryUrl);
                    handleRequest(entryUrl);
                } else {
                    console.log(count++, 'err:', err.status, entryUrl);
                }
                return;
            }
            
            if(!result.text) {
                console.log(count, entryUrl, '没有内容');
                return; 
            }
            const $ = cheerio.load(result.text);
            const aEle = $('a');
            const jq132 = $("script[src*='1.3.2']");
            const strReg = new RegExp(answers[2]);
            const isTargetIncluded = result.text.search(strReg);
            if(isTargetIncluded) {
                console.log(count, entryUrl, jq132.attr('src'));
                fs.appendFile('jq132.txt', JSON.stringify(entryUrl + '--:--' + jq132.attr('src')) + '\n');
            } else {
                console.log(count, '没有找到' + answers[2]);
            }
            count++;
            Array.prototype.forEach.call(aEle, function(link) {

                link = $(link).attr('href');
                if(filterUrl(link) && !links[link]) {
                    links[link] = true;
                    fs.appendFile('links.txt', JSON.stringify(link) + '\n');
                    if(/^\/.+(html)$/.test(link)) {
                        link = answers[0] + link;
                    }
                    handleRequest(link);
                }
            });

        });
} 

const filterUrl = (url) => {

    let regExp = new RegExp(answers[1]);
    // console.log(regExp == /^(http\:\/\/|https\:\/\/)?(about.pingan.com){1}.*(html)$|^\/(?!.*xinwen).+(html)$/);
    // regExp = /^(http\:\/\/|https\:\/\/)?(about.pingan.com){1}.*(html)$|^\/(?!.*xinwen).+(html)$/;
    let isRequiredUrl = regExp.test(url);
    if(isRequiredUrl) {
        return url;
    } else {
        return null;
    }
}
// 检查本地是否存在该文件，若存在就删除
fs.existsSync('links.txt') && fs.unlink('links.txt');
fs.existsSync('jq132.txt') && fs.unlink('jq132.txt');

const runQuestionLoop = () => {

    if(index === questions.length) {
        readEntry.close();
        handleRequest(answers[0]);
        return;
    }

    let question = questions[index];

    readEntry.question(question, (answer) => {
        console.log('您输入的内容为:', answer);
        answers[index] = answer;
        index++;
        runQuestionLoop();

    })
}
runQuestionLoop();
// 
// http.createServer(function(req, res) {

//     handleRequest(entryUrl, res, req);

//     setTimeout(() => {
//         fs.writeFileSync('links.txt', JSON.stringify(links));
//         res.write(JSON.stringify(links));
//         res.write(JSON.stringify(count));
//         res.end();
//         res.writeHead(200, {
//             'Content-Type': 'text/plain'
//         });
//     }, 1000)
    
// }).listen(3000);
