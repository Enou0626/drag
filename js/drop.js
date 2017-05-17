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
    }).on('dblclick', function (e) {
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
     * 操控栏
     *
     * */

    var checkedDom, checkedDomTitle, controlRadio;

    $('.dropArea').on('click', function (e) {//选中元素
        if (!$(e.target).hasClass('dropArea')) {//排除父元素
            $('.dropArea .form-group').css('backgroundColor', 'whitesmoke');
            if ($(e.target).hasClass('form-group')) {//限定变色元素
                $(e.target).css('backgroundColor', 'papayawhip');
                checkedDom = e.target;

                checkedDomTitle = $(checkedDom).find('label').text();
                $('.controlBox .controlTitle').val(checkedDomTitle)
            }
        }

        if ($(checkedDom).hasClass('nessesaryTag')) {
            $('#radio-true').attr('checked', 'true');
        } else {
            $('#radio-false').attr('checked', 'false');
        }

    });

    $('.controlBox .controlTitle').on('keyup', function (e) {
        $(checkedDom).find('label').text($('.controlBox .controlTitle').val());
    });

    $('.controlBox .controlRadio').on('click', function (e) {
        controlRadio = $(e.target).val();
        console.log(controlRadio);
        if (controlRadio == '1') {
            $(checkedDom).addClass('nessesaryTag');
        } else {
            $(checkedDom).removeClass('nessesaryTag');
        }
    });

    /*
     *表单名设置与获取
     * */
    var $dropAreaTitle = $('.dropArea .title');
    var $controlFormName = $('.controlFormName');
    $controlFormName.val($dropAreaTitle.text());
    $controlFormName.on('keyup', function (e) {
        $dropAreaTitle.text($(this).val());
    });

    // var formData = [
    //     {
    //         "field": {
    //             "name": "field1",
    //             "title": "基本信息",
    //             "child": [
    //                 {
    //                     "layout": {
    //                         "name": "layout1",
    //                         "child": []
    //                     },
    //                     "input": {
    //                         "name": "input1",
    //                         "type": "text",
    //                         "value": ""
    //                     },
    //                     "button": {
    //                         "name": "button1",
    //                         "type": "button",
    //                         "value": "下一步"
    //                     }
    //                 }
    //             ]
    //         }
    //     }
    // ];

    var formData = [
        {
            "field": {
                "name": "field1",
                "title": "基本信息",
                "child": [{}]
            }
        }
    ];

    // var formHtml;

    $('.save').on('click', function (e) {
        // formHtml = $('.dropArea').html();
        // console.log(formHtml);
        // localStorage.setItem('showPage', formHtml);
        // window.open('./show.html', '_self');
        // console.log($('.dropArea').find('.form-group :nth-last-child(1)'));

        var layoutChild = {};
        formData[0].field.title = $controlFormName.val();
        var $dropAreaLists = $('.dropArea').children('.form-group');

        $dropAreaLists.each(function (i, v) {
            var formControl = $(v).find('.form-control')[0];
            var $formControlLabel = $(v).find('label');

            if ($(v).hasClass('form-layout')) {
                // var $layoutChilds = $('.dropArea .form-group .layoutBox ');
                var $layoutChilds = $(v).children('.layoutBox');

                    formData[0].field.child[0]["layout"+i] = {
                    "child": []
                };

                $layoutChilds.each(function (j, v) {

                    var layoutChilds = v.getElementsByClassName('form-group');

                    $(layoutChilds).each (function (k, v) {
                        var formControl = $(v).find('.form-control')[0];
                        var $formControlLabel = $(v).find('label');
                        var hasNessesaryClass = $(v).hasClass('nessesaryTag');
                        layoutChild = {
                            "name": formControl.name
                            , "type": formControl.type
                            , "value": formControl.value
                            , "text": $formControlLabel.text()
                            , "placeHolder": formControl.placeholder
                            ,"nessesary":hasNessesaryClass
                        };

                    });

                    formData[0].field.child[0]["layout"+i]["child"].push(layoutChild);
                    layoutChild = {};

                });

            } else {
                var hasNessesaryClass = $(v).hasClass('nessesaryTag');

                formData[0].field.child[0]["dom"+i] = {
                    "name": formControl.name,
                    "type": formControl.type
                    , "value": formControl.value
                    , "text": $formControlLabel.text()
                    , "placeHolder": formControl.placeholder
                    ,"nessesary":hasNessesaryClass

                }

            }

        });

        console.log(JSON.stringify(formData));

    })

});

