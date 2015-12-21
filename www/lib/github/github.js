(function () {
}());


var Github = {};
Github.APIURL = 'https://api.github.com';
Github.APIVERSION = 'v3';
var base64encode = function (str) {
    return window.btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
};
var baseReq = Github.baseRequest = function (method, path, params, callback, mediaType, async) {
    var xhr = null;
    if (window.XMLHttpRequest) {// code for all new browsers
        xhr = new XMLHttpRequest();
    }
    else if (window.ActiveXObject) {// code for IE5 and IE6
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (xhr == null) {
        return null;
    }
    xhr.open(method, getURL(), async);

    var type = mediaType ? '.' + mediaType : '';
    var accept = 'application/vnd.github.' + Github.APIVERSION + type + '+json';
    xhr.setRequestHeader('Accept', accept);

    xhr.onreadystatechange = state_Change;
    function getURL() {
        var url = path.indexOf('//') >= 0 ? path : Github.APIURL + path;
        url += ((/\?/).test(url) ? '&' : '?');
        if (params && typeof params === 'object' && ['GET', 'HEAD', 'DELETE'].indexOf(method) > -1) {
            for (var param in params) {
                if (params.hasOwnProperty(param))
                    url += '&' + encodeURIComponent(param) + '=' + encodeURIComponent(params[param]);
            }
        }
        return url.replace(/(&timestamp=\d+)/, '') +
            (typeof window !== 'undefined' ? '&timestamp=' + new Date().getTime() : '');
    }

    function state_Change() {
        if (xhr.readyState == 4) {// 4 = "loaded"
            if (xhr.status >= 200 && xhr.status <= 300 || xhr.status == 304) {//  OK
                // ...our code here...
                callback(xhr.responseText);
            } else {
                alert("Problem retrieving XML data");
            }
        }
    };
    return xhr;
}
var mRequest = function (method, url, params, callback) {
}
//直接解析文件接口
Github.markdown2html = function (filepath) {

}
//解析已得文本内容
Github.markdown2html = function (mdcontent) {

}

//设置cookies或者本地存储当前会话，以便全局获取认证信息等用户数据
Github.saveGlobal = function () {

}
//登陆
Github.login = function (username, password, callback) {
    var xhr = baseReq('GET', '/user', null, callback);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

    var authorization = base64encode(username + ':' + password);
    xhr.setRequestHeader('Authorization', authorization);

    xhr.send();
    //
    Github.saveGlobal();

}
Github.logout = function () {

}

Github.getRepoList = function () {

}


Github.createRepo = function () {

}

Github.readFile = function (filePath) {

}

Github.append = function (file, append) {

}
//创建文件夹
Github.mkDir = function (path) {

}
Github.mkDirs = function (path) {

}

//删除文件/文件夹
Github.deletFile = function (fileOrpath) {

}


Github.getFileTree = function (path) {

}

Github.renameFile = function (oldName, newName) {

}
Github.renameRepo = function (oldName, newName) {

}
//other
Github.rebase = function () {

}
Github.push = function () {

}
Github.fork = function () {

}