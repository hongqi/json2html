var request = require('request');

var headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/x-www-form-urlencoded'
};


data = {
    "theme": "default",
    "title": "首页",
    "version": "0.0.1",
    "type": "webpage",
    "elements": [{
        "name": "richtext",
        "type": "normal",
        "deleteable": true,
        "movable": true,
        "configable": true,
        "value": {
            "text": "<div style=\"text-align: center;\"><span style=\"line-height: 1.4em; display: inline !important;\"><font size=\"4\"><b>今日头条</b></font></span></div>"
        }
    }, {
        "name": "richtext",
        "type": "normal",
        "deleteable": true,
        "movable": true,
        "configable": true,
        "value": {
            "text": "<font size=\"2\">&nbsp; &nbsp; &nbsp; &nbsp; “今日头条”是一款基于数据挖掘的推荐引擎产品，是国内移动互联网领域成长最快的产品服务之一。“今日头条”第一个版本于2012年8月上线，截至2015年3月，“今日头条”已经在为超过2.4亿的忠诚用户服务，每天有超过2000万的用户在头条上找到让他们了解世界、启发思考、开怀一笑的信息，并活跃地参与互动。</font>"
        }
    },
    {
        "name": "picture",
        "type": "normal",
        "deleteable": true,
        "movable": true,
        "configable": true,
        "value": {
            "link": "",
            "imgsrc": "http://p0.pstatp.com/origin/3190/4131751975"
        }
    },
     {
        "name": "telbutton",
        "type": "normal",
        "deleteable": true,
        "movable": true,
        "configable": true,
        "value": {
            "telnum": "18610088950",
            "width": "95"
        }
    }]
};

var options = {
    url: 'http://localhost:30001/json2html',
    method: 'POST',
    headers: headers,
    form: {data: data}
};

request(options, function (error, response, body) {

    if (!error && response.statusCode == 200) {
        console.log(JSON.parse(body))
    }
});
