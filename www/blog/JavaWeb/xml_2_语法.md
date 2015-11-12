# XML语法

>一个XML文件分为如下几部分内容
- 文档声明
- 元素
- 属性
- 注释
- CDATA、特殊字符
- 处理指令（processing instruction）


```xml
<?xml version="1.0" encoding="GB2312" standalone="no" ?>
<!--
version必须要有
encoding默认为"ISO8859-1"
standalone指明当前文档是否是一个独立的xml
-->
<?xml-stylesheet type="text/css" href="a.css" ?>
<!--处理指令，必须以"<?"开头，以"?>"结尾-->
<!--通知XML解析引擎，应用css文件显示xml文档内容-->

<!--用户信息-->
<User>
	<name id="1001" 属性="属性值" >
		<![CDATA[
			这里是CDATA区
			<又是一个标签/>
		]]>
	</name>
	<age>
		18（标签体）
	</age>
	<自闭标签/>
</User>
```
一个标签就是一个元素
标签可以嵌套，但不允许交叉嵌套
>特殊字符
```
> & --> &amp;
> < --> &lt;
> > --> &gt;
> " --> &quot;
> ' --> &apos;
```