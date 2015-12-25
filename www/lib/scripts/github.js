var Github = (function () {

    var APIURL = 'https://api.github.com';
    var APIVERSION = 'v3';
    var username;
    var password;
    var token;
    var Base64Encode = function (str) {
        var base64encode;
        if (typeof define === 'function' && define.amd) {
            define(['js-base64'], function (encode) {
                base64encode = encode.Base64.encode;
            });
        } else if (typeof module === 'object' && module.exports) {
            if (typeof window !== 'undefined') {
                base64encode = window.btoa;
            } else {
                base64encode = require('js-base64').Base64.encode;
            }
        } else {
            base64encode = function (str) {
                return this.btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
                    return String.fromCharCode('0x' + p1);
                }));
            };
        }
        return base64encode(str);
    };

    var getURL = function (path) {
        var url = path.indexOf('//') >= 0 ? path : APIURL + path;
        url += ((/\?/).test(url) ? '&' : '?');
        return url.replace(/(&timestamp=\d+)/, '') +
            (typeof window !== 'undefined' ? 'timestamp=' + new Date().getTime() : '');
    }
    var getParams = function (params) {
        var p;
        if (params && typeof params === 'object' && ['GET', 'HEAD', 'DELETE'].indexOf(method) > -1) {
            for (var param in params) {
                if (params.hasOwnProperty(param))
                    p += '&' + encodeURIComponent(param) + '=' + encodeURIComponent(params[param]);
            }
        }
        return p;
    }
    var request = function (method, path, params, callback, mediaType, async) {
        Fun.debug('Request URL : '+getURL(path));
        $.ajax(
            {
                beforeSend: function (xhr) {
                    var type = mediaType ? '.' + mediaType : '';
                    var accept = 'application/vnd.github.' + APIVERSION + type + '+json';
                    xhr.setRequestHeader('Accept', accept);
                    var authorization = 'Basic ' + Base64Encode(username + ':' + password);
                    xhr.setRequestHeader('Authorization', authorization);
                },
                type: method,
                url: getURL(path),
                data: getParams(params),
                contentType: 'application/json;charset=UTF-8',
                dataType: "json",
                async: async,
                success: function (data, textStatus) {
                    if (callback)
                        callback(data);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    if (callback)
                        callback(textStatus + " : " + errorThrown);
                },
            }
        );
    };
    //设置认证信息（用户名密码或者Token）
    this.setAuthorization = function (option) {
        username = option.username;
        password = option.password;
        token = option.token;
    }
    //列出当前用户所有仓库
    this.listPersonalRepos = function (params, callback) {
        var path = '/user/repos';
        request('GET', path, params, callback);
    }
    //列出指定用户所有公开仓库
    this.listPublicRepos = function (username, params, callback) {
        var path = '/users/' + username + '/repos';
        request('GET', path, params, callback);
    }
    //列出制定公司所有仓库
    this.listOrganizationRepos = function (orgname, params, callback) {
        var path = '/orgs/' + orgname + '/repos';
        request('GET', path, params, callback);
    }
    //创建一个个人仓库
    this.createPersonalRepo = function (params, callback) {
        var path = '/user/repos';
        request('POST', path, params, callback);
    }
    //创建一个公司仓库
    this.createOrganizationRepo = function (orgname, params, callback) {
        var path = '/orgs/' + orgname + '/repos';
        request('POST', path, params, callback);
    }


    this.getContents = function (owner, repo, file, params, callback) {
        var path = '/repos/' + owner +'/'+repo+ '/contents'+(file.substring(0,1)=='/'?'':'/')+file;
        request('GET', path, params, callback);
    }

    return this;
}
());