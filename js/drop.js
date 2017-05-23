// $(function () {
//     $('.dragArea .form-group').draggable({
//         connectToSortable: ".dropArea",
//         // helper: "clone",
//         revert: "invalid"
//     });
//
//     $(".dropArea").sortable({
//     });
//
//     var target ;
//
//     $('.form-group').draggable({
//         helper: "clone",
//         drag:function () {
//             target = this;
//         }
//
//     });
//     $('.three').droppable({
//         hoverClass: ".active",
//         drop:function (e) {
//             this.appendChild(target.cloneNode(true));
//         }
//     });
//
// });

$(function () {

    var moveDom;

    var domID;

    var tag =
        {
            index: -1, //目前鼠标正落在哪个表单元素上面
            deraction: 0,//插入位置-1，0，1 -- 前， 无其他节点， 后
            flag: -1 //区分拖拽的元素是要新增还是要交换位置，记录到flag上，1表示要新增，2表示交换位置
        };

    function getMouseLocation(event) {
        var e = event || window.event;
        var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
        var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
        var x = e.pageX - scrollX || e.clientX;
        var y = e.pageY - scrollY || e.clientY;
        return {'x': x, 'y': y};
    }

    function insertAfter(newElement, targetElement) {
        var parent = targetElement.parentNode;
        if (parent.lastChild == targetElement) {
            // 如果最后的节点是目标元素，则直接添加。因为默认是最后
            parent.appendChild(newElement);
        }
        else {
            //如果不是，则插入在目标元素的下一个兄弟节点的前面。也就是目标元素的后面
            parent.insertBefore(newElement, targetElement.nextSibling);
        }
    }

    function insertBefore(newElement, targetElement) {
        targetElement.parentNode.insertBefore(newElement, targetElement)
    }

    function setBorderDefault() {

        var $dropAreaLists = $('.dropArea .form-group');

        if ($dropAreaLists.length > 0) {

            for (var i = 0; i < $dropAreaLists.length; i++) {
                $dropAreaLists[i].style.borderBottom = "";
                $dropAreaLists[i].style.borderTop = "";

            }
        }

    }

    function dragOver(e) {
        var mouseLocation = getMouseLocation();
        var index = -1;

        //检测目前鼠标正落在哪个表单元素上面
        if ($('.dropArea .form-group').length > 0) {
            for (var i = 0; i < $('.dropArea .form-group').length; i++) {
                var pos = $('.dropArea .form-group')[i].getBoundingClientRect();
                if (mouseLocation.y >= pos.bottom)
                    continue;
                index = i;
                break;
            }
        }
        else {//第一个
            index = 0;
            tag["deraction"] = 0;
            tag["index"] = -1;
            tag["flag"] = 1;
            return;
        }

        if (index != -1) {
            var pos = $('.dropArea .form-group')[index].getBoundingClientRect();
            setBorderDefault();
            //鼠标落在表单元素宽度中间以上的部分，则上边变蓝
            if (pos.left < mouseLocation.x) {
                if ((pos.bottom + pos.top) / 2 - (moveDom.offsetHeight) / 3 > mouseLocation.y)//元素的上边变蓝
                {
                    tag["deraction"] = -1;
                    tag["index"] = index;
                    $('.dropArea .form-group')[index].style.borderTop = "2px solid blue";
                }
                else if ((pos.bottom + pos.top) / 2 + (moveDom.offsetHeight) / 3 < mouseLocation.y)//元素的下边变蓝
                {
                    // tag.flag = 2;

                    tag["deraction"] = 1;
                    tag["index"] = index;
                    $('.dropArea .form-group')[index].style.borderBottom = "2px solid blue";

                } else {//在表单控件中间
                    tag["deraction"] = 3;
                    tag["index"] = index;
                    // tag.flag = -1;
                    $('.dropArea .form-layout div').droppable({
                        accept: ".dragArea .form-group",
                        drop: function (e) {
                            var $moveDom = $(moveDom);
                            if (!$moveDom.hasClass('form-layout')) {
                                $(this).empty().append($moveDom.clone());
                            }
                        }
                    });
                }

            }

        }
        else//当前拖拽的是第一个表单元素
        {
            tag["deraction"] = 0;
            tag["index"] = -1;
        }

    }

    $('.dragArea .form-group').draggable({
        helper: 'clone',
        start: dragStart,
        stop: dragEnd,
        drag: dragOver,
        stack: '.form-group'

    });

    function dragStart(e) {

        moveDom = e.target;

        domID = Math.floor(Math.random() * 1000000);

        // $(moveDom).attr('domID',Math.floor(Math.random()*1000000));

        //区分拖拽的元素是要新增还是要交换位置，记录到flag上，1表示要新增，2表示交换位置
        if ($(moveDom).parent().hasClass('dragArea')) {
            tag.flag = 1;
        }
        else {
            tag.flag = 2;
        }
    }

    function dragEnd(e) {
        setBorderDefault();
        // moveDom = null;
    }

    function nodeDraggableInit(node) {
        node.draggable({
            greedy: true,
            helper: 'clone',
            start: dragStart,
            stop: dragEnd,
            drag: dragOver,
            stack: '.form-group'
        });
    }

    $('.dropArea').droppable({
        drop: function (e) {

            if ($(moveDom).hasClass('radio')) {
                $(moveDom).find('input').attr('name', domID);
            }

            if (tag.index != -1) {
                var index = tag.index;
                if (tag.deraction == 1) {//插上
                    var node;
                    //flag为1，插入表单元素，2是换位置
                    if (tag.flag == 1) {
                        node = $(moveDom).clone();
                        nodeDraggableInit(node);

                        insertAfter(node[0], $('.dropArea .form-group')[index]);
                    } else if (tag.flag == 2) {
                        node = moveDom;
                        insertAfter(node, $('.dropArea .form-group')[index]);
                    }
                } else if (tag.deraction == -1) {//插下
                    var node;
                    if (tag.flag == 1) {
                        node = $(moveDom).clone();

                        nodeDraggableInit(node);

                        insertBefore(node[0], $('.dropArea .form-group')[index]);
                    } else if (tag.flag == 2) {
                        node = moveDom;
                        insertBefore(node, $('.dropArea .form-group')[index]);
                    }
                }
            } else if (tag.flag == 1) {//第一个插入的表单元素
                var node = $(moveDom).clone();

                nodeDraggableInit(node);

                $('.dropArea').append(node);
            }

            tag.index = -1;

        }
    }).on('dblclick', function (e) {//双击删除
        var $target = $(e.target);
        var $targetParent = $target.parent();
        if (!$target.hasClass('dropArea')) {
            if ($targetParent.hasClass('form-layout')) {
                $targetParent.remove();
            }
            else if ($targetParent.parent().hasClass('form-layout')) {
                $targetParent.parent().remove();
            }
            else {
                $target.remove();
            }

        }
    });

    /*
     * 属性操控
     * */
    var checkedDom, checkedDomTitle;

    function selectedColor() {
        $(checkedDom).css('backgroundColor', 'papayawhip');
        checkedDomTitle = $(checkedDom).find('label').text();//得到选中元素标题文字
        $('.controlBox .controlTitle').val(checkedDomTitle);//根据得到的标题文字设置控制栏内容
    }

    $('.dropArea').on('click', function (e) {//选中元素

        $('.control-special').css('display', 'none');//隐藏所有非公共控制表单
        $('.dropArea .form-group').css('backgroundColor', 'whitesmoke');//初始化背景色

        checkedDom = e.target;

        var isFather = $(checkedDom).parent().parent().hasClass('form-group');
        var isGrandFather = $(checkedDom).parent().parent().parent().hasClass('form-group');

        if ($(checkedDom).hasClass('form-group')) {
            selectedColor();
        } else if (isFather) {
            checkedDom = $(checkedDom).parent().parent()[0];
            selectedColor();
        } else if (isGrandFather) {
            checkedDom = $(checkedDom).parent().parent().parent()[0];
            selectedColor();
        }

        if ($(checkedDom).hasClass('nessesaryTag')) {//是否必填
            $('#radio-true').attr('checked', 'true');
        } else {
            $('#radio-false').attr('checked', 'false');
        }

        if ($(checkedDom).find('label').hasClass('title-ver')) {//布局方式
            $('#radio-ver').attr('checked', 'true');
        } else {
            $('#radio-hor').attr('checked', 'false');
        }

        //各表单不同操作
        var $controlDom = $(checkedDom).find('.form-control');

        if ($controlDom[0]) {
            var nodeName = $controlDom[0].nodeName.toLowerCase();
        }

        // var isInputText = nodeName == 'input' && $controlDom[0].type == 'text';
        var isInputText = $(checkedDom).hasClass('input-text');
        var isRadios = $(checkedDom).hasClass('radio');
        var isCheckbox = $(checkedDom).hasClass('checkbox');
        var isNumber = nodeName == 'input' && $controlDom[0].type == 'number';
        var isSelect = $(checkedDom).hasClass('select');
        var isDate = $(checkedDom).hasClass('date');
        var isUpload = $(checkedDom).hasClass('upload');

        if (isInputText) {//单行或多行文本
            // console.log($controlDom[0].localName+";"+$controlDom[0].type);
            $('.control-input-width').css('display', 'block');
            $('.controlBox .input-max-length').val($controlDom[0].maxLength);

            $('.control-input-default').css('display', 'block');
            $('.controlBox .input-default').val($controlDom[0].value);

        } else if (isRadios) {
            initControlOptions($controlDom, 'radio');
        } else if (isCheckbox) {
            initControlOptions($controlDom, 'checkbox');
        } else if (isNumber) {
            $('.control-number').css('display', 'block');
            $('.controlBox .number-default').val($controlDom[0].value);
            $('.controlBox .number-max').val($controlDom[0].max);
            $('.controlBox .number-min').val($controlDom[0].min);
            $('.controlBox .number-decimal').val($controlDom[0].decimal);

        } else if (isSelect) {
            $('.control-options').css('display', 'block');
            initSelectOptions($controlDom);

        } else if (isDate) {
            $('.control-date,.control-now').css('display', 'block');
            var isNowDate = $(checkedDom).find('input')[0].nowDate || false;
            $('.control-now').find('input')[0].checked=isNowDate;

            var dateText = $(checkedDom).find('input').val();
            $('.control-date span').each(function (i, v) {
                if ($(this).text() == dateText) {
                    $(this).prev()[0].checked = true;
                }
            })

        }else if (isUpload) {
            $('.control-upload').css('display', 'block');
            var isAllowOnly = $(checkedDom).find('input')[0].allowOnly || false;
            $('.control-now').find('input')[0].checked=isAllowOnly;

        }
    });


    /*
     * 操控区事件监听
     * */

    $('.controlBox .controlTitle').on('keyup', function (e) {
        $(checkedDom).find('label').text($('.controlBox .controlTitle').val());//标题文字
    });

    $('.controlBox .controlRadio-nessesary').on('click', function (e) {//必填样式
        var controlRadio = $(e.target).val();
        if (controlRadio == '1') {
            $(checkedDom).addClass('nessesaryTag');
        } else {
            $(checkedDom).removeClass('nessesaryTag');
        }
    });

    $('.controlBox .controlRadio-lay').on('click', function (e) {//布局方式
        var controlRadio = $(e.target).val();
        if (controlRadio == '2') {
            $(checkedDom).find('label').addClass('title-ver');
        } else {
            $(checkedDom).find('label').removeClass('title-ver');
        }
    });

    $('.controlBox .controlRadio-date').on('click', function (e) {//日期格式
        var controlRadioText = $(e.target).val();
        $(checkedDom).find('input').val(controlRadioText);

    });

    $('.controlBox .controlCheckbox-date').on('click', function (e) {//使用当前日期
        var isNowDate = e.target.checked;
        $(checkedDom).find('input').prop('nowDate',isNowDate);

    });

    $('.controlBox .controlCheckbox-upload').on('click', function (e) {//上传唯一
        var allowOnly = e.target.checked;
        $(checkedDom).find('input').prop('allowOnly',allowOnly);

    });

    $('.controlBox .input-max-length').on('keyup', function (e) {
        var inputMax = $(this).val();
        $(checkedDom).children('.form-control')[0].maxLength = inputMax;//输入最大长度
    });

    $('.controlBox .input-default').on('keyup', function (e) {
        var inputDefault = $(this).val();
        $(checkedDom).children('.form-control')[0].value = inputDefault;//默认文本内容
    });

    var decimal = 0;
    var numberMax = 100;
    var numberMin = -100;

    $('.controlBox .number-decimal').on('change', function (e) {
        decimal = $('.controlBox .number-decimal')[0].value;
        // pushNumber();
        $(checkedDom).children('.form-control').prop('decimal', decimal);
    });
    $('.controlBox .number-max').on('keyup', function (e) {
        numberMax = $('.controlBox .number-max')[0].value;
        $(checkedDom).children('.form-control')[0].max = numberMax;
        // pushNumber();
    });
    $('.controlBox .number-min').on('keyup', function (e) {
        numberMin = $('.controlBox .number-min')[0].value;
        $(checkedDom).children('.form-control')[0].min = numberMin;
        // pushNumber();
    });

    function pushNumber() {
        var inputDefault = $('.controlBox .number-default').val();

        // decimal = $('.controlBox .number-decimal').value;

        if (inputDefault.indexOf(".") != -1) {
            inputDefault = inputDefault + "";
            inputDefault = inputDefault.substring(0, inputDefault.indexOf(".") + Number(decimal) + 1);
            inputDefault = Number(inputDefault);
        }

        inputDefault = Number(inputDefault);
        numberMin = Number(numberMin);
        numberMax = Number(numberMax);

        inputDefault = inputDefault > numberMax ? numberMax : inputDefault;
        inputDefault = inputDefault < numberMin ? numberMin : inputDefault;

        $(checkedDom).children('.form-control')[0].value = inputDefault;//默认数字内容
        $('.controlBox .number-default').val(inputDefault);

    }

    $('.controlBox .number-default').on('blur', pushNumber);
    $('.controlBox .number-default').on('focus', pushNumber);

    $('#options').on('keyup', function (e) {//option编辑框
        if ($(checkedDom).hasClass('radio')) {
            optionsStatusListener('radio');
        } else if ($(checkedDom).hasClass('checkbox')) {
            optionsStatusListener('checkbox');
        } else if ($(checkedDom).hasClass('select')) {
            optionsStatusListener('select');
        }
    });

    function initSelectOptions($controlDom) {
        $('.control-options').css('display', 'block');
        var textAreaStr = '';
        var optionshtml = '';

        $controlDom.each(function (i, v) {
            var value = $(v).text();
            if (v.selected) {
                optionshtml += '<option class="form-control" selected="' + v.selected + '">' + value + '</option>'
            } else {
                optionshtml += '<option class="form-control">' + value + '</option>'
            }
            textAreaStr += value + ','
        });
        textAreaStr = textAreaStr.substring(0, textAreaStr.length - 1);
        var select = document.createElement('select');
        $('.controlBox .control-options').find('select').remove();
        $('.controlBox .control-options').append(select);
        $('.controlBox .control-options select').html(optionshtml);
        // $('.controlBox .control-options').on('change',function (e) {
        //     console.log(this);
        // });

        $('#options').val(textAreaStr);

        optionsSelectedListener();
    }

    function initControlOptions($controlDom, type) {
        $('.control-options').css('display', 'block');
        var textAreaStr = '';
        var optionshtml = '';

        $controlDom.each(function (i, v) {
            var value = $(v).next('span').text();
            if (v.checked) {
                optionshtml += '<li><input type="' + type + '" name="' + v.name + '" class="form-control" checked="' + v.checked + '"><span>' + value + '</span></li>';
            } else {
                optionshtml += '<li><input type="' + type + '" name="' + v.name + '" class="form-control" ><span>' + value + '</span></li>';
            }
            textAreaStr += value + ','
        });

        textAreaStr = textAreaStr.substring(0, textAreaStr.length - 1);
        $('.controlBox .control-options ul').html(optionshtml);
        $('#options').val(textAreaStr);

        optionsCheckedListener();
    }

    function optionsSelectedListener() {
        var $options = $('.control-options');
        // console.log($optionLists[1]);
        $options.on('change', function (e) {
            var $optionlists = $options.find('option');
            $optionlists.each(function (i, v) {
                $(checkedDom).find('option')[i].selected = v.selected;
            })
        });
    }

    function optionsCheckedListener() {
        var $optionLists = $('.control-options input');
        $optionLists.on('change', function (e) {
            $optionLists.each(function (i, v) {
                $(checkedDom).find('input')[i].checked = v.checked;
            })
        });
    }

    function optionsStatusListener(type) {
        var optionsText = $('#options').val();
        optionsText = optionsText.replace(/\n/g, ',');
        var optionListsArr = optionsText.split(',');
        var controlOptionHtml = '';

        if (type == "radio" || type == "checkbox") {
            for (var i = 0; i < optionListsArr.length; i++) {
                var obj = optionListsArr[i];
                controlOptionHtml += '<li><input type="' + type + '" class="form-control" name="' + type + '"><span>' + obj + '</span></li>'
            }

            $('.controlBox .control-options ul').html(controlOptionHtml); //操作栏

            $(checkedDom).children('ul').html(controlOptionHtml); //编辑区

            optionsCheckedListener()
        } else if (type == 'select') {
            for (var i = 0; i < optionListsArr.length; i++) {
                var obj = optionListsArr[i];
                controlOptionHtml += '<option class="form-control">' + obj + '</option>'
            }

            var select = document.createElement('select');
            $('.controlBox .control-options').find('select').remove();
            $('.controlBox .control-options').append($(select).clone());
            $('.controlBox .control-options').find('select').html(controlOptionHtml);

            $(checkedDom).find('select').remove();
            $(checkedDom).append($(select).clone());
            $(checkedDom).find('select').html(controlOptionHtml);

        }


    }

    //表单名设置与获取
    var $dropAreaTitle = $('.dropArea .title');
    var $controlFormName = $('.controlFormName');
    $controlFormName.val($dropAreaTitle.text());
    $controlFormName.on('keyup', function (e) {
        $dropAreaTitle.text($(this).val());
    });

    /*
     *  遍历dom节点保存至json对象
     * */

    var formData = [//初始化json对象
        {
            // "componentkey": "FieldsetLayout",
            "title": $dropAreaTitle.text(),
            "childs": []
        }
    ];

    function initJsonObj(formControl, $formControlLabel, hasNessesaryClass, options) {

        return {
            "describe": "",
            "componentType": formControl.nodeName.toLowerCase()
            , "type": formControl.type
            , "value": formControl.value
            , "title": $formControlLabel.text()
            , "required": hasNessesaryClass
            , "defaultText": formControl.value
            , "maxLength": formControl.maxLength
            , "options": options
            , "maxNumber": formControl.max
            , "minNumber": formControl.min
            , "decimal": formControl.decimal || 0
            , "nowDate": formControl.nowDate || false
            , "allowOnly": formControl.allowOnly || false

        };
    }

    function optionsToJson(v, options) {
        if ($(v).hasClass('radio') || $(v).hasClass('checkbox')) {

            $(v).find('ul li').each(function (i, v) {
                var text = $(v).children('span').text();
                var checked = $(v).children('input')[0].checked;
                options.push({"checked": checked, "text": text});

            });

        } else if ($(v).hasClass('select')) {

            $(v).find('option').each(function (i, v) {
                var text = $(v).text();
                var selected = v.selected;
                options.push({"selected": selected, "text": text});

            });

        }
    }

    $('.save').on('click', function (e) {

        formData[0].title = $controlFormName.val();
        var $dropAreaLists = $('.dropArea').children('.form-group');

        $dropAreaLists.each(function (i, v) {
            var layoutChild = null;
            var formControl = $(v).find('.form-control')[0];
            var $formControlLabel = $(v).find('label');

            if ($(v).hasClass('form-layout')) { // 布局控件
                var $layoutChilds = $(v).children('.layoutBox');

                formData[0].childs[i] = {
                    "layout": []
                };

                $layoutChilds.each(function (j, v) {

                    var layoutChilds = v.getElementsByClassName('form-group');

                    $(layoutChilds).each(function (k, v) {
                        var formControl = $(v).find('.form-control')[0];
                        var $formControlLabel = $(v).find('label');
                        var hasNessesaryClass = $(v).hasClass('nessesaryTag');
                        var options = [];
                        optionsToJson(v, options);

                        layoutChild = initJsonObj(formControl,
                            $formControlLabel, hasNessesaryClass, options);

                    });

                    formData[0].childs[i].layout.push(layoutChild);
                    layoutChild = null;

                });

            } else {
                var hasNessesaryClass = $(v).hasClass('nessesaryTag');
                var options = [];
                optionsToJson(v, options);

                formData[0].childs[i] = initJsonObj(formControl,
                    $formControlLabel, hasNessesaryClass, options);

            }

        });

        console.log(JSON.stringify(formData));

    })

});

