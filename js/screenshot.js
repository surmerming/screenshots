/**
 * Created with IntelliJ IDEA.
 * User: surmerming
 * Date: 13-8-18
 * Time: 下午2:06
 * To change this template use File | Settings | File Templates.
 */
/**
 * Created with IntelliJ IDEA.
 * User: admin
 * Date: 13-8-15
 * Time: 下午2:23
 * To change this template use File | Settings | File Templates.
 */

AirDroid = {};
AirDroid.Module = {};
AirDroid.Module.ScreenShot = {

    bodyImg: null,
    canvas: null,
    context: null,
    windowWidth: 0,
    windowHeight: 0,
    pxFloatPace: 5,
	borderPx: 3,

    //绘制截图区域
    drawDownX: 0,
    drawDownY: 0,
    drawMoveX: 0,
    drawMoveY: 0,
    drawDownRectLeft: 0,
    drawDownRectTop: 0,
    drawDownRectWidth: 0,
    drawDownRectHeight: 0,

    //改变截图区域大小或位置
    changeDownX: 0,
    changeDownY: 0,
    changeDownRectLeft: 0,
    changeDownRectTop: 0,
    changeDownRectWidth: 0,
    changeDownRectHeight: 0,
    changeMoveX: 0,
    changeMoveY: 0,
    changeMoveLeft: 0,
    changeMoveTop: 0,
    changeMoveWidth: 0,
    changeMoveHeight: 0,

    changeMode: -1,
    dragOrResize: -1,

    isCapture: false,
    paint: false,
    isCanDraw: false,
    isDrawMouseDown: false,
    isResizeMouseDown: false,


    initialize: function(){
        var self = this;
        self.windowWidth = $(window).get(0).innerWidth;
        self.windowHeight  = $(window).get(0).innerHeight;
        $('body').height(self.windowHeight);

        self.delegateEvent();

        //解除右键的使用功能
        $(document).bind('contextmenu', function(e){
            //如果正在使用截图功能，解除右键的使用功能
            if(self.isCapture){
                return false;
            }
            return true;
        });
        $(document).bind('scroll', function(e){
            if(self.isCapture){
                return false;
            }
            return true;
        });
    },

    delegateEvent: function(){

        var self = this;

        self.startCapture();

        self.drawRectDiv();

        self.sureOrCancel();

        self.changingCapture();
    },

    startCapture: function(){
        var self = this;
        $(document).delegate('#airdroid_capture_mask_capture','click',function(){
            $('#airdroid_capture_mask_capture').hide();
            
            html2canvas($('body'),{
                onrendered: function(htmlCanvas) {

                    self.bodyImg = htmlCanvas.toDataURL();
                    console.log(self.bodyImg);
	                
	                self.isCanDraw = true;

	                $('#airdroid_capture_mask').remove();
	                var _captureMask = $('<div id="airdroid_capture_mask"></div>');
	                _captureMask.css({'top':'0px','left':'0px','width':self.windowWidth,
		                'height':self.windowHeight});
	                $('body').append(_captureMask);
                }
            });
        });

    },

    drawRectDiv: function(){
        var self = this;
        $(document).delegate('#airdroid_capture_mask','mousedown',function(event){
            if(self.isCanDraw  && !self.isCapture){
                self.drawDownX = event.pageX;
                self.drawDownY = event.pageY;
                self.paint = true;
	            //console.log("drawRectDiv-->mousedown");
            }
        });

        $(document).delegate('#airdroid_capture_mask','mousemove',function(event){
            if(self.isCanDraw && self.paint  && !self.isCapture){
                self.drawMoveX = event.pageX;
                self.drawMoveY = event.pageY;

                if(self.drawMoveX<=self.windowWidth && self.drawMoveY<=self.windowHeight){

	                self.drawDownRectLeft = self.drawMoveX>=self.drawDownX ? self.drawDownX : self.drawMoveX;
	                self.drawDownRectTop = self.drawMoveY>=self.drawDownY ? self.drawDownY : self.drawMoveY;
	                self.drawDownRectWidth = Math.abs(self.drawMoveX-self.drawDownX);
	                self.drawDownRectHeight = Math.abs(self.drawMoveY-self.drawDownY);

                    console.log("draw mousemove");  
	                self.addMask(self.drawDownRectLeft, self.drawDownRectTop, self.drawDownRectWidth, self.drawDownRectHeight);

                }
            }
        });

        $(document).delegate('#airdroid_capture_mask','mouseup',function(){
            self.paint = false;
            self.isCanDraw = false;
            if($('#airdroid_capture_mask').length>0){
               self.isCapture = true; 
            }
            
        });
    },

    sureOrCancel: function(){
        var self = this;
        $(document).delegate('#airdroid_capture_shadow_sure','click',function(){

            self.downRectLeft = $('#airdroid_capture_shadow_area').offset().left;
            self.downRectTop = $('#airdroid_capture_shadow_area').offset().top;
            self.downRectWidth = $('#airdroid_capture_shadow_area').width();
            self.downRectHeight = $('#airdroid_capture_shadow_area').height();

            $('#myCanvas').remove();
            //self.canvas = $("<canvas id='myCanvas' width='"+self.windowWidth+"' height='"+self.windowHeight+"'></canvas>");
            self.canvas = $("<canvas id='myCanvas' width='"+self.downRectWidth+"' height='"+self.downRectHeight+"'></canvas>");
            $('body').append(self.canvas);
            self.context = self.canvas.get(0).getContext('2d');

            self.context.clearRect(0,0,self.windowWidth,self.windowHeight);
            var cutImg = new Image();
            cutImg.src = self.bodyImg;

            cutImg.onload = function(){
                console.log("裁剪图片中");
                self.context.drawImage(cutImg,self.downRectLeft,self.downRectTop,self.downRectWidth,self.downRectHeight,0,0,self.downRectWidth,self.downRectHeight);
                var res = self.context.canvas.toDataURL();
                //console.log(res);
                $("#myCanvas").remove();
                $('img#preview').remove();
                //$('body').append('<img src="'+res+'" id="preview" />');
                console.log(res);
                localStorage.setItem("airdroid_capture_img_res", res);
                $('#airdroid_capture_mask_capture').show();
                $('#airdroid_capture_mask').remove();
                window.open("showImage.html");
            };

            self.isCapture = false;

        });

        $(document).delegate('#airdroid_capture_shadow_cancel','click',function(){
            $('#airdroid_capture_mask').remove();
            $('#airdroid_capture_mask_capture').show();
            self.isCapture = false;

        });
    },

    changingCapture: function(){
        var self = this;
        $('body').mousedown(function(event){
            if($('#airdroid_capture_shadow_area').length>0){

                
                self.changeDownX = event.clientX;
                self.changeDownY = event.clientY;

                self.changeDownRectLeft = $('#airdroid_capture_shadow_area').offset().left;
                self.changeDownRectTop = $('#airdroid_capture_shadow_area').offset().top;
                self.changeDownRectWidth = $('#airdroid_capture_shadow_area').width();
                self.changeDownRectHeight = $('#airdroid_capture_shadow_area').height();
                if(self.isInArea()){
                    self.isResizeMouseDown = true;
                    self.mouseTypeFunc(event, 1);
                }
                
            }

        });

        $('body').mousemove(function(event){
            if($('#airdroid_capture_shadow_area').length>0){
                self.mouseTypeFunc(event, 0);
                if(self.isResizeMouseDown){ 
                    console.log("body mousemove");                   
                    self.changeDetail();
                }

            }
        });

        $('body').mouseup(function(){
            self.isResizeMouseDown = false;  
            self.dragOrResize = -1;
            self.changeMode = -1;

        });
    },

    isInArea: function() {
        var self = this;
        var _pxFloatPace = self.pxFloatPace;
        var _minusWest = self.changeDownX - self.changeDownRectLeft;
        var _minusEast = self.changeDownX - (self.changeDownRectLeft + self.changeDownRectWidth);
        var _minusNorth = self.changeDownY - self.changeDownRectTop;
        var _minusSouth = self.changeDownY - (self.changeDownRectTop + self.changeDownRectHeight);

        if(_minusEast>_pxFloatPace || _minusWest<-_pxFloatPace || _minusSouth>_pxFloatPace
            || _minusNorth<-_pxFloatPace){
            return false;
        }
        return true;
    },

    mouseTypeFunc: function(event, type){
        var self = this;
        var _pxFloatPace = self.pxFloatPace;

        self.changeMoveLeft = $('#airdroid_capture_shadow_area').offset().left;
        self.changeMoveTop = $('#airdroid_capture_shadow_area').offset().top;
        self.changeMoveWidth = $('#airdroid_capture_shadow_area').width();
        self.changeMoveHeight = $('#airdroid_capture_shadow_area').height();

        self.changeMoveX = event.clientX;
        self.changeMoveY = event.clientY;

        var _minusWest = self.changeMoveX - self.changeMoveLeft;
        var _minusEast = self.changeMoveX - (self.changeMoveLeft + self.changeMoveWidth);
        var _minusNorth = self.changeMoveY - self.changeMoveTop;
        var _minusSouth = self.changeMoveY - (self.changeMoveTop + self.changeMoveHeight);

        if(_minusEast<-_pxFloatPace && _minusWest>_pxFloatPace && _minusSouth<-_pxFloatPace
            && _minusNorth>_pxFloatPace){
            console.log("中间");
            $('#airdroid_capture_shadow_area').css({'cursor':'move','z-index':4});
            if(type==1){
                self.changeMode = 0;
                self.dragOrResize = 0;
                console.log("changemode or drag resize:"+self.changeMode+","+self.dragOrResize);
            }
        }

        if(_minusNorth>=-_pxFloatPace && _minusNorth<=_pxFloatPace && _minusEast<-_pxFloatPace
            && _minusWest>_pxFloatPace){
            console.log("北边");
            $('#airdroid_capture_shadow_area').css({'cursor':'n-resize','z-index':4});
            if(type==1){
                self.changeMode = 1;
                self.dragOrResize = 1;
            }
        }
        if(_minusSouth>=-_pxFloatPace && _minusSouth<=_pxFloatPace && _minusEast<-_pxFloatPace
            && _minusWest>_pxFloatPace){
            console.log("南边");
            $('#airdroid_capture_shadow_area').css({'cursor':'s-resize','z-index':4});

            if(type==1){
                self.changeMode = 2;
                self.dragOrResize = 1;
            }

        }

        if(_minusWest>=-_pxFloatPace && _minusWest<=_pxFloatPace && _minusSouth<-_pxFloatPace 
            && _minusNorth>_pxFloatPace){
            console.log("西边");
            $('#airdroid_capture_shadow_area').css('cursor','w-resize');

            if(type==1){
                self.changeMode = 3;
                self.dragOrResize = 1;
            }
        }

        if(_minusEast>=-_pxFloatPace && _minusEast<=_pxFloatPace && _minusSouth<-_pxFloatPace 
            && _minusNorth>_pxFloatPace){
            console.log("东边");
            $('#airdroid_capture_shadow_area').css('cursor','e-resize');

            if(type==1){
                self.changeMode = 4;
                self.dragOrResize = 1;
            }
        }

        if(_minusWest>=-_pxFloatPace && _minusWest<=_pxFloatPace && _minusNorth>=-_pxFloatPace 
            && _minusNorth<=_pxFloatPace){
            console.log("西北边");
            $('#airdroid_capture_shadow_area').css('cursor','nw-resize');

            if(type==1){
                self.changeMode = 5;
                self.dragOrResize = 1;
            }
        }

        if(_minusWest>=-_pxFloatPace && _minusWest<=_pxFloatPace && _minusSouth>=-_pxFloatPace 
            && _minusSouth<=_pxFloatPace){
            console.log("西南边");
            $('#airdroid_capture_shadow_area').css('cursor','sw-resize');

            if(type==1){
                self.changeMode = 6;
                self.dragOrResize = 1;
            }
        }

        if(_minusEast>=-_pxFloatPace && _minusEast<=_pxFloatPace && _minusNorth>=-_pxFloatPace 
            && _minusNorth<=_pxFloatPace){
            console.log("东北边");
            $('#airdroid_capture_shadow_area').css('cursor','ne-resize');

            if(type==1){
                self.changeMode = 7;
                self.dragOrResize = 1;
            }
        }

        if(_minusEast>=-_pxFloatPace && _minusEast<=_pxFloatPace && _minusSouth>=-_pxFloatPace 
            && _minusSouth<=_pxFloatPace){
            console.log("东南边");
            $('#airdroid_capture_shadow_area').css('cursor','se-resize');
            if(type==1){
                self.changeMode = 8;
                self.dragOrResize = 1;
            }

        }
        //console.log("changemode or drag resize:"+self.changeMode+","+self.dragOrResize);
    },

    changeDetail: function(){
        var self = this;
        var _resizeLeft = 0;
        var _resizeTop = 0;
        var _resizeWidth = 0;
        var _resizeHeight=0;
        

        if(self.dragOrResize==0 && self.changeMode==0){
            _resizeLeft = self.changeMoveLeft + (self.changeMoveX-self.changeDownX);
            _resizeTop = self.changeMoveTop + (self.changeMoveY-self.changeDownY);
            _resizeWidth = self.changeMoveWidth;
            _resizeHeight = self.changeMoveHeight;

            self.changeDownX  = self.changeMoveX;
            self.changeDownY  = self.changeMoveY;

        }

        if(self.dragOrResize==1 && self.changeMode>0){
            switch(self.changeMode){
                case 1:
                    console.log("dragMode北");
                    _resizeLeft = self.changeDownRectLeft;
                    _resizeTop = (self.changeMoveY>=(self.changeDownRectTop+self.changeDownRectHeight)) ? (self.changeDownRectTop+self.changeDownRectHeight) : self.changeMoveY;
                    _resizeWidth = self.changeDownRectWidth;
                    _resizeHeight = Math.abs(self.changeDownRectTop + self.changeDownRectHeight - self.changeMoveY);
                    break;
                //南
                case 2:
                    console.log("dragMode南");
                    _resizeLeft = self.changeDownRectLeft;
                    _resizeTop = (self.changeMoveY>=self.changeDownRectTop) ? self.changeDownRectTop : self.changeMoveY;
                    _resizeWidth = self.changeDownRectWidth;
                    _resizeHeight = Math.abs(self.changeDownRectTop - self.changeMoveY);
                    break;
                //西
                case 3:
                    console.log("dragMode西");
                    _resizeLeft = self.changeMoveX<=(self.changeDownRectLeft+self.changeDownRectWidth) ? self.changeMoveX : (self.changeDownRectLeft+self.changeDownRectWidth);
                    _resizeTop = self.changeDownRectTop;
                    _resizeWidth = Math.abs(self.changeDownRectLeft+self.changeDownRectWidth-self.changeMoveX);
                    _resizeHeight = self.changeDownRectHeight;
                    break;
                //东
                case 4:
                    console.log("dragMode东");
                    _resizeLeft = self.changeMoveX>=self.changeDownRectLeft ? self.changeDownRectLeft : self.changeMoveX;
                    _resizeTop = self.changeDownRectTop;
                    _resizeWidth = Math.abs(self.changeMoveX-self.changeDownRectLeft);
                    _resizeHeight = self.changeDownRectHeight;
                    break;
                //西北
                case 5:
                    console.log("dragMode西北");
                    _resizeLeft = (self.changeDownRectLeft+self.changeDownRectWidth)>self.changeMoveX ? self.changeMoveX : (self.changeDownRectLeft+self.changeDownRectWidth);
                    _resizeTop = (self.changeDownRectTop+self.changeDownRectHeight)>self.changeMoveY ? self.changeMoveY : (self.changeDownRectTop+self.changeDownRectHeight);
                    _resizeWidth = Math.abs(self.changeDownRectLeft+self.changeDownRectWidth-self.changeMoveX);
                    _resizeHeight = Math.abs(self.changeDownRectTop+self.changeDownRectHeight-self.changeMoveY);
                    break;
                //西南
                case 6:
                    console.log("dragMode西南");
                    _resizeLeft = self.changeMoveX<(self.changeDownRectLeft+self.changeDownRectWidth) ? self.changeMoveX : (self.changeDownRectLeft+self.changeDownRectWidth);
                    _resizeTop = self.changeMoveY>=self.changeDownRectTop ? self.changeDownRectTop : self.changeMoveY;
                    _resizeWidth = Math.abs(self.changeDownRectLeft + self.changeDownRectWidth - self.changeMoveX);
                    _resizeHeight = Math.abs(self.changeDownRectTop - self.changeMoveY);
                    break;
                //东北
                case 7:
                    console.log("dragMode东北");
                    _resizeLeft = self.changeMoveX>self.changeDownRectLeft ? self.changeDownRectLeft : self.changeMoveX;
                    _resizeTop = self.changeMoveY<=(self.changeDownRectTop+self.changeDownRectHeight) ? self.changeMoveY : (self.changeDownRectTop+self.changeDownRectHeight);
                    _resizeWidth = Math.abs(self.changeDownRectLeft - self.changeMoveX);
                    _resizeHeight = Math.abs(self.changeDownRectTop+self.changeDownRectHeight - self.changeMoveY);
                    break;
                //东南
                case 8:
                    console.log("dragMode东南");
                    _resizeLeft = self.changeMoveX>self.changeDownRectLeft ? self.changeDownRectLeft : self.changeMoveX;
                    _resizeTop = self.changeMoveY>self.changeDownRectTop ? self.changeDownRectTop : self.changeMoveY;
                    _resizeWidth = Math.abs(self.changeDownRectLeft - self.changeMoveX);
                    _resizeHeight = Math.abs(self.changeDownRectTop - self.changeMoveY);
                    break;
            }
            
        }
        if(_resizeTop<0 || _resizeLeft<0 || (_resizeLeft+_resizeWidth)>self.windowWidth || (_resizeTop+_resizeHeight)>self.windowHeight){
            return false;
        }
        else{
            self.addMask(_resizeLeft, _resizeTop, _resizeWidth, _resizeHeight); 
        }
        
        //console.log("changedownRect:"+self.changeDownRectLeft+","+self.changeDownRectTop+","+self.changeDownRectWidth+","+self.changeDownRectHeight);

       //console.log("resize:"+_resizeLeft+","+_resizeTop+","+_resizeWidth+","+_resizeHeight);
                   
      
    },

    //添加锚点
    addArchor: function(_offsetLeft, _offsetTop, _offsetWidth, _offsetHeight){
        var self = this;
        self.addPerArchor('airdroid_capture_shadow_north_west', _offsetTop, _offsetLeft);
        self.addPerArchor('airdroid_capture_shadow_north_east', _offsetTop, _offsetLeft+_offsetWidth);
        self.addPerArchor('airdroid_capture_shadow_south_west', _offsetTop+_offsetHeight, _offsetLeft);
        self.addPerArchor('airdroid_capture_shadow_south_east', _offsetTop+_offsetHeight, _offsetLeft+_offsetWidth);
        self.addPerArchor('airdroid_capture_shadow_middle_north', _offsetTop, _offsetLeft+_offsetWidth/2);
        self.addPerArchor('airdroid_capture_shadow_middle_south', _offsetTop+_offsetHeight, _offsetLeft+_offsetWidth/2);
        self.addPerArchor('airdroid_capture_shadow_middle_west', _offsetTop+_offsetHeight/2, _offsetLeft);
        self.addPerArchor('airdroid_capture_shadow_middle_east', _offsetTop+_offsetHeight/2, _offsetLeft+_offsetWidth);
    },

    addPerArchor: function(archorPos, offsetTop, offsetLeft){
        var self = this;
        //添加具体锚点
        $('#'+archorPos).remove();
        var archor = $('<div id="'+archorPos+'" class="archor-capture"></div>');
        archor.css({'top':offsetTop-1,'left':offsetLeft-1});
        $('#airdroid_capture_shadow_archor').append(archor);

    },

    addMask: function(left, top, width, height){
        var self = this;
        $('#airdroid_capture_mask').empty();

        var _captureMask = $('<div id="airdroid_capture_mask_area"></div>');
        var _captureTop = $('<div id="airdroid_capture_shadow_top"></div>');
        var _captureBottom = $('<div id="airdroid_capture_shadow_bottom"></div>');
        var _captureLeft = $('<div id="airdroid_capture_shadow_left"></div>');
        var _captureRight = $('<div id="airdroid_capture_shadow_right"></div>');

        var _captureArea = $('<div id="airdroid_capture_shadow_area"></div>');
        var _captureSize = $('<div id="airdroid_capture_shadow_size"></div>');
        var _captureCancel = $('<div id="airdroid_capture_shadow_cancel">取消</div>');
        var _captureSure = $('<div id="airdroid_capture_shadow_sure">确定</div>');

        var _captureArchor = $('<div id="airdroid_capture_shadow_archor"></div>');

        _captureMask.css({'top':top,'left':left,'width':width,'height':height});
        _captureArea.css({'height':height,'width':width,'left':left,'top':top});
        _captureTop.css({'height':top,'width':left+width});
        _captureBottom.css({'height':self.windowHeight-top-height,'width':self.windowWidth-left,'disabled':true});
        _captureLeft.css({'height':self.windowHeight-top,'width':left,'disabled':true});
        _captureRight.css({'height':top+height,'width':self.windowWidth-left-width,'disabled':true});

        if(top<18){
            _captureSize.css('top','0px');
        }else{
            _captureSize.css('top','-18px'); 
        }
        if(self.windowHeight-top-height>=35){
            _captureCancel.css('bottom','-35px');
            _captureSure.css('bottom','-35px');
        }else{
            _captureCancel.css('bottom','0px');
            _captureSure.css('bottom','0px');
        }

        if(width<100 && (left+width)<self.windowWidth){
            _captureCancel.css('left','8px');
            _captureSure.css('left','70px');
        }

        _captureSize.html(width+" * "+height);
        $('#airdroid_capture_shadow_size').attr('disabled','disabled');

        $('#airdroid_capture_mask').append(_captureTop);
        $('#airdroid_capture_mask').append(_captureBottom);
        $('#airdroid_capture_mask').append(_captureLeft);
        $('#airdroid_capture_mask').append(_captureRight);
        $('#airdroid_capture_mask').append(_captureArea);
        $('#airdroid_capture_mask').append(_captureArchor);
        
        $('#airdroid_capture_mask').append(_captureMask);

        $(_captureMask).append(_captureSize);
        $(_captureMask).append(_captureCancel);
        $(_captureMask).append(_captureSure);

        self.addArchor(left, top, width, height);
    }

}



