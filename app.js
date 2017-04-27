const http = require('http'),
      url = require('url');
      superagent = require('superagent'),
      cheerio = require('cheerio'),
      async = require('async'),
      eventproxy = require('eventproxy'),
      fs = require('fs');

const entryUrl = 'http://about.pingan.com';
const links = {};
const urls = [];
let count = 0;

const handleRequest = (entryUrl) => {

    // const path = req.url;
    // const queryParams = url.parse(path, true).query;
    // const callback = queryParams.callback;
    
    superagent.get(entryUrl)
    .end(function(err, result) {

        if(err) {
            console.log(count++, entryUrl,  'err:', err.status);
            return;
        }
        
        if(!result.text) {
            console.log(count, entryUrl, '没有内容');
            return; 
        }
        const $ = cheerio.load(result.text);
        const aEle = $('a');
        const jq132 = $("script[src*='1.3.2']");
        if(jq132.length) {
            console.log(count, entryUrl, jq132.attr('src'));
            fs.appendFile('jq132.txt', JSON.stringify(entryUrl + '--:--' + jq132.attr('src')) + '\n');
        } else {
            console.log(count, '没有 jq 1.3.2');
        }
        count++;
        Array.prototype.forEach.call(aEle, function(link){

            link = $(link).attr('href');
            if(filterUrl(link) && !links[link]) {
                links[link] = true;
                urls.push(link);
                fs.appendFile('links.txt', JSON.stringify(link) + '\n');
                if(/^\/.+(html)$/.test(link)) {
                    link = 'http://about.pingan.com' + link;
                }
                
                handleRequest(link);
            }
        });
    })
} 

const filterUrl = (url) => {

    const regExp = /^(http\:\/\/|https\:\/\/)?(about.pingan.com){1}.*(html)$|^\/(?!.*xinwen).+(html)$/;
    let isRequiredUrl = regExp.test(url);
    if(isRequiredUrl) {
        return url;
    } else {
        return null;
    }
}
if(fs.existsSync('links.txt')) {
    fs.unlink('links.txt');
}
if(fs.existsSync('jq132.txt')) {
                fs.unlink('jq132.txt');
            }
handleRequest(entryUrl);
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
