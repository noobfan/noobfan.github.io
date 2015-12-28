

Github = (function () {
        var Logger = {
            debug: function (log) {
                console.log(log);
            }
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
        var GetXmlHttpRequest=function(){
            var xhr = null;
            if (window.XMLHttpRequest) {// code for all new browsers
                xhr = new XMLHttpRequest();
            } else if (window.ActiveXObject) {// code for IE5 and IE6
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            } else {
                Logger.debug("[X] Browser does not support XMLHttpRequest.");
                return null;
            }
            return xhr;
        }
        var CheckOption = function (option) {
            if (!option) option = {};
            option.method = option.method;
            option.url = option.url;
            option.data = option.data;
            option.contentType = option.contentType;
            option.dataType = option.dataType;
            option.async = option.async ? option.async : true;
            option.timeout = option.timeout ? option.timeout : 1500;
            return option;
        };
        var HttpRequest = function (option) {
            var self = this;
            var hook = null;
            var xhr = getXmlHttpRequest();
            if(!xhr) return null;

            CheckOption(option);

            this.addHeader = function (header, value) {
                xhr.setRequestHeader(header, value);
            };
            this.callback = function (cb) {
                if (option.async)
                    hook = cb;
                else
                    Logger.debug("[!] [" + option.url + '] is not async!');
            };
            this.request = function (method, url, params) {
                option.method = method;
                option.url = url;
                option.data = params;
                if (option.async) {
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4) {// 4 = "loaded"
                            if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                                if (hook)
                                    hook(true, xhr.responseText);
                            } else {
                                if (hook)
                                    hook(false, xhr.status, xhr.responseText);
                            }
                        }
                    }
                    xhr.open(method, url, true);
                    return self;
                } else {
                    xhr.open(method, url, false);
                    return xhr.send(params);
                }
            }
            this.get = function (url, params) {
                return request('GET', url, params);
            }

            this.post = function (url, params) {
                return request('POST', url, params);
            }
            this.put = function (url, params) {
                return request('PUT', url, params);
            }
            this.delete = function (url, params) {
                return request('DELETE', url, params);
            }
            return self;
        }

        var API = {
            HOST: 'https://api.github.com',
            VERSION: 'v3',
            REQUEST_COUNT: 0,
            Authorization: null,
            MediaType: null,
            Accept: 'application/vnd.github.' + VERSION + (MediaType ? '.' + MediaType : '') + '+json',
            ContentType: 'application/json;charset=UTF-8',
        }

        var Request = function () {
            HttpRequest.call(this);

        }
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
//--------------------------------------------------------------------------------------------------------------------
        var request = function (method, path, params, option) {
            if (option == null) option = {};
            var REQUEST_INDEX = "GITHUB REQUEST #" + ++REQUEST_COUNT;
            var url = getURL(path);
            var data = getParams(method, params);
            if (data == null)
                data = (params instanceof Object ? JSON.stringify(params) : params);
            Logger.debug('[+] ' + REQUEST_INDEX + ' -> ' + url + (data ? '&' + data : ''));
            $.ajax(
                {
                    beforeSend: function (xhr) {
                        if ((option.oauth ? option.oauth : true) && Authorization && Authorization.username && Authorization.password) {
                            var type = option.mediaType ? '.' + option.mediaType : '';
                            var accept = 'application/vnd.github.' + APIVERSION + type + '+json';
                            xhr.setRequestHeader('Accept', accept);
                            var authorization = 'Basic ' + Base64Encode(Authorization.username + ':' + Authorization.password);
                            xhr.setRequestHeader('Authorization', authorization);
                        }
                    },
                    type: method,
                    url: url,
                    data: data,
                    contentType: (option.contentType ? option.contentType : 'application/json') + ';charset=UTF-8',
                    dataType: option.dataType ? option.dataType : "json",
                    processData: option.processData,
                    async: option.async,
                    timeout: option.timeout,
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

//--------------------------------------------------------------------------------------------------------------------


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
        this.getRepo = function (owner, repo) {
            return new Repository(owner, repo);
        }

        function Fun(s1, s2) {
            var str = s1 + s2;
        }

        var Repository = function (ownerName, repoName) {

            this.execute = function (callback) {
                setTimeout(function () {
                    callback(str);
                }, 1000);
            };
            this.run = this.execute;

            var base_url = '/repos/' + owner + '/' + repo;

            this.delete = function (callback) {
                request('DELETE', url, null, callback);
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
            this.getContents = function (params, callback) {
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
                var tree = 'master';
                var recursive = true;
                if (params) {
                    tree = params.branch ? params.branch : 'master';
                    params.branch = null;
                    if (params.recursive)
                        recursive = params.recursive;
                }
                var url = '/repos/' + owner + '/' + repo + '/git/trees/' + tree;
                request('GET', url, {data: {recursive: recursive}}, callback);
            }

        };


        return this;
    }
    ()
)
;