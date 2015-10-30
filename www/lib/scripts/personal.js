
jQuery.resizeView = function (id) {
    $(function(){
        if(window.parent!=window) {
            //取到窗口的高度
            var winH = $(window).height();
            //取到页面的高度
            var bodyH = $(document).height();
            if (bodyH > winH) {
                window.parent.document.getElementById(id).height = bodyH;
            } else {
                window.parent.document.getElementById(id).height = winH;
            }
        }
    });
};

jQuery.readText=function(file,callback,async){
    if(file){
        Fun.debug("load file:"+file);
        $(function() {
            $.ajax({
                url: file,
                dataType: 'text',
                async: async?true:false ,
                success: function(data, textStatus){
                    //data可能是xmlDoc、jsonObj、html、text等等
                    //this;  //调用本次ajax请求时传递的options参数
                    Fun.debug("load file done:"+file+"-->"+data);
                    callback(data);
                },
                error:function(XMLHttpRequest, textStatus, errorThrown){
                    //通常情况下textStatus和errorThrown只有其中一个包含信息
                    //this;   //调用本次ajax请求时传递的options参数
                    Fun.debug("load file error:"+errorThrown);
                }
            });
        });
    }else{
        Fun.debug("file undefine");
    }
};

var Fun={};
Fun.debug=function(log){
    console.log(log);
};

Fun.setArgs = function(key,value){
    var p = [];
    p.push( key + '=' + value);
    return encodeURI('?' + p.join('&'));
};

Fun.getArgs = function(key) {
    var retval;
    var params = location.search;
    if (!params) {
        return;
    }
    var Args   = params.split("?");
    if(Args[0] == params){
        return;
    }
    var str = Args[1];
    var args = str.split("&");
    for(var i = 0; i < args.length; i ++)
    {
        str = args[i];
        var arg = str.split("=");
        if(arg.length <= 1) continue;
        if(arg[0] == key){
            retval = arg[1];
            break;
        }
    }
    return retval;
};

Fun.replaceHtml=function(s){
    s = s.replace(/>/g, "&gt;");
    s = s.replace(/</g, "&lt;");
    s = s.replace(/ /g, " &nbsp;");
    s = s.replace(/\"/g, "&quot;");
    s = s.replace(/\'/g, "&#39;");
    s = s.replace(/\n/g, "<br/>");
    return s;
};