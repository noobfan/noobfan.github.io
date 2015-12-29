var Fun = {};
Fun.debug = function (log) {
    // return;
    console.log(log);
};

Fun.setArgs = function (key, value) {
    var p = [];
    p.push(key + '=' + value);
    return encodeURI('?' + p.join('&'));
};

Fun.getArgs = function (key) {
    var retval;
    var params = location.search;
    if (!params) {
        return;
    }
    var Args = params.split("?");
    if (Args[0] == params) {
        return;
    }
    var str = Args[1];
    var args = str.split("&");
    for (var i = 0; i < args.length; i++) {
        str = args[i];
        var arg = str.split("=");
        if (arg.length <= 1) continue;
        if (arg[0] == key) {
            retval = arg[1];
            break;
        }
    }
    return retval;
};

Fun.replaceHtml = function (s) {
    s = s.replace(/>/g, "&gt;");
    s = s.replace(/</g, "&lt;");
    s = s.replace(/ /g, " &nbsp;");
    s = s.replace(/\"/g, "&quot;");
    s = s.replace(/\'/g, "&#39;");
    s = s.replace(/\n/g, "<br/>");
    return s;
};
Fun.resizeIframe = function (iframeId) {
    var ifm = document.getElementById(iframeId);
    var subWeb = document.frames ? document.frames[iframeId].document : ifm.contentDocument;
    if (ifm && subWeb) {
        ifm.height = subWeb.body.scrollHeight;
        ifm.width = subWeb.body.scrollWidth;
    } else {
        Fun.debug(ifm + subWeb);
    }
}
Fun.resizeParentIframe = function (iframeId) {
    if (id)
        $(function () {
            if (window.parent != window) {
                var winH = $(window).height();
                var bodyH = $(document).height();
                if (bodyH > winH) {
                    window.parent.document.getElementById(id).height = bodyH;
                } else {
                    window.parent.document.getElementById(id).height = winH;
                }
            }
        });

};

Fun.imgLoaded = function (callback) {
    var imgs = document.getElementsByTagName("img");
    for (var i = 0; i < imgs.length; i++) {
        imgs[i].addEventListener("load", callback);
    }
}
Fun.readText = function (file, callback, async) {
    if (file) {
        //Fun.debug("load file:"+file);
        $(function () {
            $.ajax({
                url: file,
                dataType: 'text',
                async: async ? async : true,
                success: function (data, textStatus) {
                    if (callback)
                        callback(true, data);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    if (callback)
                        callback(false, textStatus + " " + errorThrown);
                }
            });
        });
    } else {
        //Fun.debug("file undefine");
    }
};


Fun.loadMD = function (fromFile, toElementID, iframe) {
    Fun.readText(fromFile, function (ret, text) {
        if (text) {
            Github.Markdown2Html(text, true)
                .callback(function (ret, data) {
                    Fun.debug(ret ? 'load from github api' : 'load from markdown.js');
                    data = ret ? data : markdown.toHTML(text);
                    var content = document.getElementById(toElementID);
                    content.innerHTML = data;
                    $('pre code').each(function (i, block) {
                        hljs.highlightBlock(block);
                    });
                    $('p code').each(function (i, block) {
                        hljs.highlightBlock(block);
                    });
                }
            )
        } else {

        }
    });
};


Fun.isMobile = function () {
    var MobileAgent = new Array(
        "iphone", "ipod", "ipad", "android", "mobile",
        "blackberry", "webos", "incognito", "webmate",
        "bada", "nokia", "lg", "ucweb", "skyfire"
    );
    var UA = navigator.userAgent.toLowerCase();
    for (var i = 0; i < MobileAgent.length; i++) {
        if (UA.indexOf(MobileAgent[i]) != -1) {
            return true;
            ;
        }
    }
    return false;
};
Fun.redirect = function (www, mobile) {
    if (isMobile() && mobile) {
        location.href += mobile;
    } else {
        location.href += www;
    }
}

