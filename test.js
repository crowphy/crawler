const readline = require('readline');

const readEntry = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const questions = ['请输入您要过滤的链接正则表达式，形如：/regExp/:'];
const answers = [];
let index = 0;
const url = 'http://about.pingan.com/index.shtml'
const runQuestionLoop = () => {

    if(index === questions.length) {
        let regExp = new RegExp(answers[0]);
        console.log(regExp);
        console.log(regExp.test(url));
        readEntry.close();
        // handleRequest(answers[0]);
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