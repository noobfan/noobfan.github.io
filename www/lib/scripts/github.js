Github = (function () {

    var APIURL = 'https://api.github.com';
    var APIVERSION = 'v3';
    var Authorization;
    var REQUEST_COUNT = 0;
    var Logger = {}
    Logger.debug = function (log) {
        console.log(log);
    }
    this.Base64Encode = function (str) {
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

    this.Base64Decode = function (str) {
        var base64decode;
        if (typeof define === 'function' && define.amd) {
            define(['js-base64'], function (decode) {
                base64decode = decode.Base64.decode;
            });
        } else if (typeof module === 'object' && module.exports) {
            if (typeof window !== 'undefined') {
                base64decode = window.atob;
            } else {
                base64decode = require('js-base64').Base64.decode;
            }
        } else {
            base64decode = function (str) {
                return decodeURIComponent(this.atob(str));
            };
        }
        return base64decode(str);
    };
    var getURL = function (path, timestamp) {
        var url = path.indexOf('//') >= 0 ? path : APIURL + path;
        url += ((/\?/).test(url) ? '&' : '?');
        timestamp = timestamp ? (typeof window !== 'undefined' ? 'timestamp=' + new Date().getTime() : '') : '';
        return url.replace(/(&timestamp=\d+)/, '') + timestamp;
    }
    var getParams = function (method, params) {
        var p;
        if (params && params instanceof Object && ['GET', 'HEAD', 'DELETE'].indexOf(method) > -1) {
            for (var param in params) {
                if (params.hasOwnProperty(param)) {
                    var key = param;
                    var value = params[param];
                    if (key && value) {
                        if (p)
                            p += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(value);
                        else
                            p = encodeURIComponent(key) + '=' + encodeURIComponent(value);
                    }

                }
            }
        }
        return p;
    }
    var request = function (method, path, params, callback) {
        if (params == null) params = {};
        var REQUEST_INDEX = "GITHUB REQUEST #" + ++REQUEST_COUNT;
        var url = getURL(path);
        var data = getParams(method, params.data);
        if (data == null)
            data = (params.data instanceof Object ? JSON.stringify(params.data) : params.data);
        Logger.debug('[+] ' + REQUEST_INDEX + ' -> ' + url + (data ? '&' + data : ''));
        $.ajax(
            {
                beforeSend: function (xhr) {
                    if ((params.oauth ? params.oauth : true) && Authorization && Authorization.username && Authorization.password) {
                        var type = params.mediaType ? '.' + params.mediaType : '';
                        var accept = 'application/vnd.github.' + APIVERSION + type + '+json';
                        xhr.setRequestHeader('Accept', accept);
                        var authorization = 'Basic ' + Base64Encode(Authorization.username + ':' + Authorization.password);
                        xhr.setRequestHeader('Authorization', authorization);
                    }
                },
                type: method,
                url: url,
                data: data,
                contentType: (params.contentType ? params.contentType : 'application/json') + ';charset=UTF-8',
                dataType: params.dataType ? params.dataType : "json",
                processData: params.processData,
                async: params.async,
                timeout: params.timeout,
                success: function (data, textStatus) {
                    if (data instanceof  Object) {
                        Logger.debug('[-] ' + REQUEST_INDEX + ' <-  ' + url);
                        Logger.debug(data);
                    } else {
                        Logger.debug('[-] ' + REQUEST_INDEX + ' <-  ' + url + ' <-  ' + data);
                    }
                    if (callback)
                        callback(true, data);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    Logger.debug('[X] ' + REQUEST_INDEX + ' <-  ' + url + ' <-  ' + textStatus + " : " + errorThrown);
                    if (callback)
                        callback(false, textStatus + " : " + errorThrown);
                },
                complete: function () {

                }
            }
        );
    };
    /**
     *
     * @param content
     * @param raw
     * @param callback
     * @constructor
     */
    this.Markdown2Html = function () {
        var content;
        var raw;
        var callback;
        if (arguments.length == 1) {
            content = arguments[0];
        } else if (arguments.length == 2) {
            content = arguments[0];
            callback = arguments[1];
        } else if (arguments.length == 3) {
            content = arguments[0];
            raw = arguments[1];
            callback = arguments[2];
        } else {
            return;
        }
        var url = '/markdown' + (raw ? "/raw" : '');
        request('POST', url, {
            data: raw ? content : {
                text: content,
                mode: "gfm",
                context: "github/gollum",
            },
            timeout: 2000,
            oauth: false,
            progressData: false,
            dataType: 'html',
            contentType: raw ? "text/plain" : "text/html",
        }, callback)
    }

    //设置认证信息（用户名密码或者Token）
    this.setAuthorization = function (option) {
        Authorization = option;
    }

    this.show = function (callback) {
        var url = '/user';
        request('GET', url, null, callback);
    };

    //列出当前用户所有仓库(包括个人的和公司的)
    this.listPersonalRepos = function (params, callback) {
        var url = '/user/repos';
        request('GET', url, {data: params}, callback);
    }
    //列出指定用户所有公开仓库
    this.listUserRepos = function (username, params, callback) {
        var url = '/users/' + username + '/repos';
        request('GET', url, {data: params}, callback);
    }
    //列出指定组织机构所有仓库
    this.listOrganizationRepos = function (orgname, params, callback) {
        var url = '/orgs/' + orgname + '/repos';
        request('GET', url, {data: params}, callback);
    }
    //创建一个个人仓库
    this.createPersonalRepo = function (params, callback) {
        var url = '/user/repos';
        request('POST', url, {data: params}, callback);
    }
    //创建一个组织机构仓库
    this.createOrganizationRepo = function (orgname, params, callback) {
        var url = '/orgs/' + orgname + '/repos';
        request('POST', url, {data: params}, callback);
    }
    //删除一个仓库
    this.deleteRepo = function (owner, repo, params, callback) {
        var url = '/repos/' + owner + repo;
        request('DELETE', url, {data: params}, callback);
    }


    /**
     *
     * @param owner
     * @param repo
     * @param path
     * @param params    path    :string    The content path.
     *                  ref    :string    The name of the commit/branch/tag.
     *                           Default: the repository’s default branch (usually master)
     * @param callback
     */
    this.getContents = function (owner, repo, params, callback) {
        var path
        if (params instanceof Object) {
            path = params.path;
            params = null;
        } else {
            path = params;
        }
        path = path ? (( path.substring(0, 1) == '/' ? '' : '/') + encodeURI(path)) : '';
        var url = '/repos/' + owner + '/' + repo + '/contents' + path;
        request('GET', url, {data: params}, callback);
    }

    /**
     *
     * @param owner
     * @param repo     repo name
     * @param path     rootpath
     * @param params
     *                  path    :string    Required. The content path.
     *                  message    :string    Required. The commit message.
     *                  content    :string    Required. The new file content, Base64 encoded.
     *                  branch    :string    The branch name. Default: the repository’s default branch (usually master)
     *
     * @param callback
     */
    this.createFile = function (owner, repo, params, callback) {
        if (params) {
            var path = params.path;
            path = path ? (( path.substring(0, 1) == '/' ? '' : '/') + encodeURI(path)) : '';
            var url = '/repos/' + owner + '/' + repo + '/contents' + path;
            params.content = Base64Encode(params.content);
            request('PUT', url, {data: params}, callback);
        }
    }

    this.updateFile = function (owner, repo, params, callback) {
        var path = params.path;
        getContents(owner, repo, path, function (ret, data) {
            if (ret) {
                path = path ? (( path.substring(0, 1) == '/' ? '' : '/') + encodeURI(path)) : '';
                var url = '/repos/' + owner + '/' + repo + '/contents' + path;
                params.content = Base64Encode(params.content);
                params.sha = data.sha;
                request('PUT', url, {data: params}, callback);
            } else {
                callback(ret, data);
            }
        });
    }

    this.deleteFile = function (owner, repo, params, callback) {
        var path = params.path;
        getContents(owner, repo, path, function (ret, data) {
            if (ret) {
                path = path ? (( path.substring(0, 1) == '/' ? '' : '/') + encodeURI(path)) : '';
                var url = '/repos/' + owner + '/' + repo + '/contents' + path;
                params.sha = data.sha;
                params.message = data.message ? data.message : Authorization.username;
                request('DELETE', url, {data: params}, callback);
            } else {
                callback(ret, data);
            }
        });
    }

    this.getTree = function (owner, repo, params, callback) {
        var tree='master';
        var recursive=true;
        if(params){
            tree=params.branch?params.branch:'master';
            params.branch=null;
            if(params.recursive)
                recursive=params.recursive;
        }
        var url = '/repos/' + owner + '/' + repo + '/git/trees/' + tree;
        request('GET', url, {data:{recursive:recursive}}, callback);
    }

    return this;
}
());