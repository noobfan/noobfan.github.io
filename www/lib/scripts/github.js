(
    function (root, factory) {
        root.Github = factory(root);
    }(this, function (root) {
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
                    return root.btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
                        return String.fromCharCode('0x' + p1);
                    }));
                };
            }
            return base64encode(str);
        };

        var APIURL = 'https://api.github.com';
        var APIVERSION = 'v3';
        var Github = function (option) {
            var getURL = function (path) {
                var url = path.indexOf('//') >= 0 ? path : APIURL + path;
                url += ((/\?/).test(url) ? '&' : '?');
                return url.replace(/(&timestamp=\d+)/, '') +
                    (typeof window !== 'undefined' ? '&timestamp=' + new Date().getTime() : '');
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
                $.ajax(
                    {
                        beforeSend: function (xhr) {
                            var type = mediaType ? '.' + mediaType : '';
                            var accept = 'application/vnd.github.' + APIVERSION + type + '+json';
                            xhr.setRequestHeader('Accept', accept);
                            var authorization = 'Basic ' + Base64Encode(option.username + ':' + option.password);
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

            this.show = function (username, callback) {
                var path = username ? '/users/' + username : '/user';
                request('GET', path, null, callback);
            };

            this.Repositories = function () {
                return new function () {
                    this.listPersonalRepos = function (params, callback) {
                        var path = '/user/repos';
                        request('GET', path, params, callback);
                    }
                    this.listPublicRepos = function (username, params, callback) {
                        var path = '/users/' + username + '/repos';
                        request('GET', path, params, callback);
                    }

                    this.listOrganizationRepos = function (orgname, params, callback) {
                        var path = '/orgs/' + orgname + '/repos';
                        request('GET', path, params, callback);
                    }

                    this.createPersonalRepo = function (params, callback) {
                        var path = '/user/repos';
                        request('POST', path, params, callback);
                    }
                    this.createOrganizationRepo = function (orgname, params, callback) {
                        var path = '/orgs/' + orgname + '/repos';
                        request('POST', path, params, callback);
                    }
                }
            };

            return this;
        };
        return Github;
    })
)