(function ($) {
    var clipBox = function (appendedTarget,origBoxWidth,origBoxHeight,previewBoxWidth,previewBoxHeight) {
        var self = this;
        this.appendTarget = appendedTarget;
        //设置盒子宽高
        this.origBoxWidth = origBoxWidth;
        this.origBoxHeight = origBoxHeight;
        this.previewBoxWidth = previewBoxWidth;
        this.previewBoxHeight = previewBoxHeight;

        //canvas
        this.previewCanvas = null;//canvas画布
        this.previewCanvasPen = null;//canvas画笔
        this.clipWidth = null;
        this.clipHeight = null;
        this.startX = null;
        this.startY = null;


        //元素
        this.origBox = null;
        this.previewBox = null;
        this.picUp = null;
        this.reader = new FileReader();//文件读取

        //图像属性
        this.URL = null;//获取图像URL
        this.img = new Image();
        this.shrinkPicWidth = null;//缩小后宽高
        this.shrinkPicHeight = null;
        this.scale = 1;//缩放比例
        this.resultScale = 1;//最终缩放比例
        this.margin_left = null;//使图像居中
        this.margin_top = null;
        this.jcrop_holder = null;//jcrop的div
        this.jcrop_tracker = null;//移动盒子
        this.jcropObject = null;



        this.init();
        this.getElement();


        //事件绑定
        this.getOrigPicURL();
        // this.imgIntoOrigBox();

        this.upButton.onclick = function (ev) {
            self.trasform_upload();
        };

        //读取完成的事件绑定
        this.reader.onload = function (ev2) {

            console.log(this.result);
            self.URL =  this.result;//这里的this为self.reader;

            //重置
            if(self.origBox.getElementsByTagName("img")[0]){
                self.origBox.removeChild(self.img);
            }
            self.img = null;
            self.img = new Image();
            self.img.setAttribute("id","target");

            //重置图片，事件绑定
            self.img.onload = function () {


                //侦听imgonload

                if(self.jcropObject){
                    self.jcropObject.destroy();
                }
                //获取图片属性
                self.origPicWidth = self.img.width;
                self.origPicHeight = self.img.height;
                self.shrinkPicWidth = self.img.width;
                self.shrinkPicHeight = self.img.height;
                var areaWidth = self.origBoxWidth * 0.9;
                var areaHeight = self.origBoxHeight * 0.9;
                //图像缩小
                while (self.shrinkPicWidth > areaWidth || self.shrinkPicHeight > areaHeight){
                    self.scale = Math.min(areaWidth/self.shrinkPicWidth , areaHeight/self.shrinkPicHeight);
                    self.shrinkPicWidth = self.shrinkPicWidth * self.scale;
                    self.shrinkPicHeight = self.shrinkPicHeight * self.scale;
                    self.resultScale = self.resultScale * self.scale;
                }
                self.margin_left = (self.origBoxWidth - self.shrinkPicWidth)/2;
                self.margin_top = (self.origBoxHeight - self.shrinkPicHeight)/2;
                this.style.width = self.shrinkPicWidth + "px";
                this.style.height = self.shrinkPicHeight + "px";
                self.origBox.appendChild(self.img);



                self.insert_jcrop();
                // Jcrop的缘故，改用内边距
                self.jcrop_holder = document.getElementsByClassName("jcrop-holder")[0];
                self.jcrop_holder.style.marginLeft = self.margin_left + "px";
                self.jcrop_holder.style.marginTop= self.margin_top + "px";
                //事件绑定
                self.jcrop_tracker = document.getElementsByClassName("jcrop-tracker")[0];
                self.jcrop_tracker.onmousemove = function (ev) {
                    //用canvas画出预览头像，jcrop的预览本质还是同一张图片
                    self.render();
                }
            };
            self.img.src = self.URL;
            self.resultScale = self.scale = 1;

        };
    };


    clipBox.prototype = {
        //初始化标签
        init : function () {
            this.clipBox = document.createElement("div");
            this.clipBox.setAttribute("id","clipBox");
            this.clipBox.innerHTML = "<!--原图区-->" +
                "<div id='origBox'></div>" +
                "<!--头像预览区-->" +
                "<div id='previewBox'><canvas id='previewCanvas'></canvas></div>" +
                "<input type='file' id = 'picUp'>" +
                "<button id='upButton'>上传头像</button>"+
                "<div class='f-clear'></div>";
            this.appendTarget.appendChild(this.clipBox);
        },

        //获取元素，渲染样式
        getElement : function () {
            this.origBox = document.getElementById("origBox");
            this.previewBox = document.getElementById("previewBox");
            this.previewCanvas = document.getElementById("previewCanvas");
            this.picUp = document.getElementById("picUp");
            this.upButton = document.getElementById("upButton");




            //canvas画笔
            if(this.previewCanvas.getContext){
                this.previewCanvasPen = this.previewCanvas.getContext("2d");
            }

            //渲染样式
            this.origBox.style.width = this.origBoxWidth + "px";
            this.origBox.style.height = this.origBoxHeight + "px";
            this.previewBox.style.width = this.previewBoxWidth + "px";
            this.previewBox.style.height = this.previewBoxHeight + "px";
            this.previewCanvas.width = this.previewBoxWidth;
            this.previewCanvas.height = this.previewBoxHeight;


        },

        getOrigPicURL : function () {
            //侦听获取文件
            var self = this ;
            this.picUp.onchange = function (ev) {


                self.picFile = this.files[0];//每个file的<input>元素都有一个files属性

               console.log(this.files);
                console.log(self.picFile);
                //格式判断
                if(self.picFile.type != "image/jpeg" && self.picFile.type != "image/png"){
                    alert("请上传正确格式");
                    // this.files.length = 0;
                    this.value = '';

                    return false;
                }

                //读取picFile
                self.reader.readAsDataURL(self.picFile);




            }
        },



        //要在图片加载完后使用脚本！！
        insert_jcrop : function () {
            var self =this;

            //设为对象
            self.jcropObject = $.Jcrop('#target',{
                allowSelect : false,
                bgColor : "black",
                minSize : [50,50],
                maxSize : [this.previewBoxWidth,this.previewBoxHeight],
                onChange : function () {
                    self.render();

                },
                onSelect : function () {
                    self.render();

                }
            });

            //计算初始位置
            var x1 = parseInt(self.shrinkPicWidth)/2 - 50;
            var y1 = parseInt(self.shrinkPicHeight)/2 - 50;
            var x2 = parseInt(self.shrinkPicWidth)/2 + 50;
            var y2 = parseInt(self.shrinkPicHeight)/2 + 50;
            //对象方法调用
            self.jcropObject.animateTo([x1,y1,x2,y2]);



        },

        //渲染到canvss中,不需要重新设置self
        render : function () {
            var self = this;
            self.previewCanvasPen.clearRect(0,0,self.previewBoxWidth,self.previewBoxHeight);

            self.startX = self.jcropObject.tellScaled()["x"] /self.resultScale;
            self.startY = self.jcropObject.tellScaled()["y"] /self.resultScale;
            self.clipWidth = self.jcropObject.tellScaled()["w"]/self.resultScale;
            self.clipHeight = self.jcropObject.tellScaled()["h"]/self.resultScale;
            self.previewCanvasPen.drawImage(self.img , self.startX , self.startY , self.clipWidth , self.clipHeight , 0 , 0 , self.previewBoxWidth , self.previewBoxHeight);
        },


        trasform_upload : function () {
            //转换数据
            //本来该用blob的，因为某些原因改用JSon
            var self = this;
            var data = self.previewCanvas.toDataURL();
            var imgBase64Object = {
                "pic" : data
            };

            //ajax上传
            var headUploadxhr = new XMLHttpRequest();
            headUploadxhr.onreadystatechange = function (ev) {
                if (headUploadxhr.readyState === 4)
                {
                    if ((headUploadxhr.status >=200 && headUploadxhr.status <300) || headUploadxhr === 304){
                        alert("上传头像成功");
                        self.previewCanvasPen.clearRect(0,0,200,200);
                        self.origBox.removeChild(self.origBox.getElementsByTagName("img")[0]);
                    }else {
                        alert("上传失败  " + "status : " + headUploadxhr.status);
                    }
                }
            };
            //清除
            self.previewCanvasPen.clearRect(0,0,200,200);
            self.origBox.removeChild(self.img);
            self.jcropObject.destroy();
            console.log(self.origBox);
            headUploadxhr.open("post","php",true);
            headUploadxhr.send(JSON.stringify(imgBase64Object));





        }



    };

    window["clipBox"] = clipBox;
})(jQuery);