# profile-picture-crop
头像裁剪插件——canvas+Jcrop+jquery

使用示例

\<div id = "test">\</div><br><br>    
\<script><br>
    var test = document.getElementById("test");<br>
    var clipBox = new clipBox(test,600,600,200,200);<br>
\</script>
    
    
new clipBox参数：new clipBox(插入插件的元素，放置原图区域宽度，放置原图区域高度，预览区域宽度，预览区域高度)
