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
        var getXmlHttpRequest = function () {
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
            if (!option || !option instanceof Object) option = {};
            option.oauth = option.oauth ? option.oauth : true;
            option.method = option.method;
            option.url = option.url;
            option.data = option.data;
            option.contentType = option.contentType;
            option.dataType = option.dataType;
            option.charSet = option.charSet;
            option.async = option.async ? option.async : true;
            option.timeout = option.timeout ? option.timeout : 1500;
            return option;
        };
        var HttpRequest = function (option) {
            var self = this;
            var hook = null;
            var xhr = getXmlHttpRequest();
            if (!xhr) return null;
            var headers = new Array();

            var options = CheckOption(option);

            this.callback = function (cb) {
                if (options.async)
                    hook = cb;
                else
                    Logger.debug("[!] [" + options.url + '] is not async!');
            };

            this.addHeader = function (key, value) {
                if (key && value) {
                    headers[headers.length] = {key: key, value: value};
                }
            };

            this.request = function (method, url, params) {
                options.method = method;
                options.url = url;
                options.data = params;
                API.REQUEST_COUNT++;
                var REQUEST_INDEX = API.REQUEST_COUNT;
                Logger.debug('[+] #' + REQUEST_INDEX + ' <' + options.method + '> ' + options.url);
                if (options.data)
                    Logger.debug(options.data);
                if (options.async) {
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == xhr.DONE) {
                            try {
                                var resp = JSON.parse(xhr.responseText);
                            } catch (thrown) {
                                resp = xhr.responseText;
                            }
                            if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                                Logger.debug('[-] #' + REQUEST_INDEX + ' <' + options.method + '> ' + options.url);
                                Logger.debug(resp);
                                if (hook)
                                    hook(true, resp);
                            } else {
                                Logger.debug('[X] #' + REQUEST_INDEX + ' <' + options.method + '> ' + options.url);
                                Logger.debug(xhr.status + ': ' + (resp instanceof Object ? resp.message : resp));
                                if (hook) {
                                    hook(false, resp);
                                }
                            }
                        }
                    }
                    xhr.open(options.method, options.url, options.async);
                    for (var i = 0; i < headers.length; i++) {
                        var header = headers[i];
                        var key = header.key;
                        var value = header.value;
                        if (key && value) {
                            xhr.setRequestHeader(key, value);
                        }
                    }

                    if (options.data)
                        xhr.send(options.data);
                    else
                        xhr.send();
                    return self;
                } else {
                    if (options.data)
                        return xhr.send(options.data);
                    else
                        return xhr.send();
                }
            }
            if (options.dataType)
                xhr.dataType = options.dataType;
            if (options.contentType) {
                var type = options.contentType + ';charset=' + (options.charSet ? options.charSet : 'UTF-8');
                this.addHeader('Content-Type', options.contentType);
            }
            return self;
        }

        var API = {
            HOST: 'https://api.github.com',
            VERSION: 'v3',
            REQUEST_COUNT: 0,
            Authorization: null,
            MediaType: null,
            Accept: 'application/vnd.github.' + this.VERSION + (this.MediaType ? this.MediaType : '') + '+json',
            ContentType: 'application/json;charset=UTF-8',
        }

        var getURL = function (path, timestamp) {
            var url = path.indexOf('//') >= 0 ? path : API.HOST + path;
            url += ((/\?/).test(url) ? '&' : '?');
            timestamp = timestamp ? (typeof window !== 'undefined' ? 'timestamp=' + new Date().getTime() : '') : '';
            return url.replace(/(&timestamp=\d+)/, '') + timestamp;
        }
        var getParams = function (params) {
            var p;
            if (params && params instanceof Object) {
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

        var http = function (option) {
            if (!option || !option instanceof Object)
                option = {};
            HttpRequest.call(this, option);

            var type = API.MediaType ? '.' + API.MediaType : '';
            var accept = 'application/vnd.github.' + API.VERSION + type + '+json';
            addHeader('Accept', accept);

            if (option.oauth && API.Authorization) {
                var oauth = API.Authorization;
                var authorization = oauth.token ? 'token ' + oauth.token :
                'Basic ' + Base64Encode(oauth.username + ':' + oauth.password)
                addHeader('Authorization', authorization);
            }
            if (!option.dataType)
                option.dataType = 'json';
            if (!option.contentType)
                option.contentType = 'application/json';


            var Request = function (method, url, params) {
                return request(method, getURL(url), params);
            };
            this.get = function (url, params) {
                return Request('GET', url, getParams(params));
            }
            this.post = function (url, params) {
                return Request('POST', url, params instanceof Object ? JSON.stringify(params) : params);
            }
            this.put = function (url, params) {
                return Request('PUT', url, params instanceof Object ? JSON.stringify(params) : params);
            }
            this.delete = function (url, params) {
                return Request('DELETE', url, params instanceof Object ? JSON.stringify(params) : params);
            }
            return this;
        }
// --------------------------------------------------------------------------------------------------------------------

        /**
         *
         * @param content
         * @param raw
         * @param callback
         * @constructor
         */
        this.Markdown2Html = function (content, raw) {
            var url = '/markdown' + (raw ? "/raw" : '');
            this.callback = http({
                timeout: 2000,
                oauth: false,
                dataType: 'html',
                contentType: raw ? 'text/plain' : 'text/html',
            }).post(url, raw ? content : {
                    text: content,
                    mode: "gfm",
                    context: "github/gollum",
                }
            ).callback;
            return this;
        }

// 设置认证信息（用户名密码或者Token）
        this.Authorization = {
            setToken: function (token) {
                API.Authorization = {token: token};
            },
            setAuthor: function (username, passwod) {
                API.Authorization = {username: username, password: passwod};
            }
        }

// --------------------------------------------------------------------------------------------------------------------

        this.show = function (callback) {
            var url = '/user';
            this.callback = http().get(url).callback;
            return this;
        };

        this.listPersonalRepos = function (params, callback) {
            var url = '/user/repos';
            this.callback = http().get(url, params).callback;
            return this;
        }

        this.listUserRepos = function (username, params, callback) {
            var url = '/users/' + username + '/repos';
            this.callback = http().get(url, params).callback;
            return this;
        }

        this.listOrganizationRepos = function (orgname, params, callback) {
            var url = '/orgs/' + orgname + '/repos';
            this.callback = http().get(url, params).callback;
            return this;
        }

        this.createPersonalRepo = function (params, callback) {
            var url = '/user/repos';
            this.callback = http().post(url, params).callback;
            return this;
        }

        this.createOrganizationRepo = function (orgname, params, callback) {
            var url = '/orgs/' + orgname + '/repos';
            this.callback = http().post(url, params).callback;
            return this;
        }

// --------------------------------------------------------------------------------------------------------------------
        this.getRepo = function (owner, repo) {
            return new Repository(owner, repo);
        }

        var Repository = function (owner, repo) {
            var base_url = '/repos/' + owner + '/' + repo;
            var getPath = function (path, param) {
                param = param ? (( param.substring(0, 1) == '/' ? '' : '/') + encodeURI(param)) : '';
                return base_url + (path ? path : '') + param;
            }
            var getSha = function (path, branch) {
                var url = getPath('/contents', path + (branch ? '?branch=' + branch : ''));
                this.callback = http().get(url).callback;
                return this;
            }
            this.delete = function () {
                var url = getPath();
                this.callback = http().delete(url).callback;
                return this;
            }

            this.getContents = function (path, ref) {
                var url = getPath('/contents', path);
                this.callback = http().get(url).callback;
                return this;
            }

            this.createFile = function (path, content, message, branch) {
                var url = getPath('/contents', path);
                this.callback = http().put(url, {
                    message: message ? message : API.Authorization.username,
                    content: Base64Encode(content),
                    branch: branch
                }).callback;
                return this;
            }

            this.updateFile = function (path, content, message, branch) {
                var hook;
                this.callback = function (cb) {
                    hook = cb;
                }
                getSha(path, branch).callback(function (ret, data) {
                    if (ret) {
                        var url = getPath('/contents', path);
                        http().put(url, {
                            content: Base64Encode(content),
                            sha: data.sha,
                            message: message ? message : (data.message ? data.message : API.Authorization.username),
                            branch: branch
                        }).callback(hook);
                    } else {
                        if (hook)
                            hook(ret, data);
                    }
                });
                return this;
            }

            this.deleteFile = function (path, branch) {
                var hook;
                this.callback = function (cb) {
                    hook = cb;
                }
                getSha(path, branch).callback(function (ret, data) {
                    if (ret) {
                        var url = getPath('/contents', path);
                        http().delete(url, {
                            path: data.path,
                            message: data.message ? data.message : API.Authorization.username,
                            sha: data.sha,
                            branch: branch
                        }).callback(hook);
                    } else {
                        if (hook)
                            hook(ret, data);
                    }
                });
                return this;
            }

            this.getTree = function (tree, recursive) {
                var url = getPath('/git/trees', tree ? tree : 'master');
                this.callback = http().get(url, {recursive: recursive ? recursive : true}).callback;
                return this;
            }

            this.getBlob = function (sha) {
                var url = getPath('/git/blobs', sha);
                this.callback = http().get(url).callback;
                return this;
            }

            this.postBlob = function (content) {
                if (typeof (content) === 'string') {
                    content = {
                        content: content,
                        encoding: 'utf-8'
                    };
                } else {
                    content = {
                        content: Base64Encode(content),
                        encoding: 'base64'
                    };
                }
                var url = getPath('/git/blobs');
                this.callback = http().post(url, content).callback;
                return this;
            }
        };
// --------------------------------------------------------------------------------------------------------------------

        return this;
    }
    ()
)
;