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

        // var e = event || window.event;
        // var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
        // var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
        // var x = e.pageX || e.clientX - scrollX;
        // var y = e.pageY || e.clientY - scrollY;
        // return {'x': x, 'y': y};
    }

    function insertAfter(newElement, targetElement) {
        console.log('after');
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
        console.log('before');

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

    // $('.dragArea .form-group').attr('draggable', true);


    function dragOver(e) {
        // e.preventDefault();

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
                if ((pos.bottom + pos.top) / 2 - (moveDom.offsetHeight) / 4 > mouseLocation.y)//元素的上边变蓝
                {
                    tag.flag = 2;

                    tag["deraction"] = -1;
                    tag["index"] = index;
                    $('.dropArea .form-group')[index].style.borderTop = "2px solid blue";
                }
                else if ((pos.bottom + pos.top) / 2 + (moveDom.offsetHeight) / 4 < mouseLocation.y)//元素的下边变蓝
                {
                    tag.flag = 2;

                    tag["deraction"] = 1;
                    tag["index"] = index;
                    $('.dropArea .form-group')[index].style.borderBottom = "2px solid blue";

                } else {
                    tag["deraction"] = 3;
                    tag["index"] = index;
                    tag.flag = -1;
                    $('.form-layout div').droppable({
                        drop: function (e) {
                            var $moveDom = $(moveDom);
                            if (!$moveDom.hasClass('form-layout')) {
                                $(this).empty().append(moveDom.cloneNode(true));
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

    /*
     * 布局表单
     * */
    // $('.form-layout div').on('dragover', function (e) {
    //     e.preventDefault();
    //
    // }).on('drop', function (e) {
    //     var $moveDom = $(moveDom);
    //     if (!$moveDom.hasClass('form-layout')) {
    //         $(this).empty().append(moveDom.cloneNode(true));
    //     }
    //
    // });

    // $('.form-layout div').droppable({
    //     drop: function (e) {
    //         var $moveDom = $(moveDom);
    //         if (!$moveDom.hasClass('form-layout')) {
    //             $(this).empty().append(moveDom.cloneNode(true));
    //         }
    //     }
    // });


    function dragStart(e) {

        moveDom = e.target;

        //区分拖拽的元素是要新增还是要交换位置，记录到flag上，1表示要新增，2表示交换位置
        if ($(moveDom).parent().hasClass('dragArea')) {
            tag.flag = 1;
        }
        else {
            tag.flag = 2;

            // $('.dragArea').on("dragover", function (e) {
            //     e.preventDefault();
            // });

        }
        console.log(tag.flag);
    }


    function dragEnd(e) {
        setBorderDefault();
        moveDom = null;
        // $('.dropArea .form-group').draggable({ revert: true });

        // $('.dragArea .form-layout div').attr('draggable', false);
        //
        // $('.dragArea')[0].removeEventListener("dragover", function (e) {
        //     e.preventDefault();
        // });

    }


    $('.dropArea').droppable({
        drop: function (e) {
            if (tag.index != -1) {
                var index = tag.index;
                if (tag.deraction >0) {//插上
                    var node;
                    //flag为1，插入表单元素，2是换位置
                    if (tag.flag == 1) {
                        node = $(moveDom).clone();
                        node.draggable({
                            greedy: true,
                            helper: 'clone',
                            start: dragStart,
                            stop: dragEnd,
                            drag: dragOver,
                            stack: '.form-group'
                        });
                        insertAfter(node[0], $('.dropArea .form-group')[index]);
                    }
                    else if (tag.flag == 2) {
                        console.log('flag2');
                        node = moveDom;
                        insertAfter(node, $('.dropArea .form-group')[index]);

                    }
                }
                else if (tag.deraction <0) {//插下
                    var node;
                    if (tag.flag == 1) {
                        node = $(moveDom).clone();

                        node.draggable({
                            greedy: true,
                            helper: 'clone',
                            start: dragStart,
                            drag: dragOver,
                            stack: '.form-group',
                            stop: dragEnd
                        });
                        insertBefore(node[0], $('.dropArea .form-group')[index]);
                    }
                    else {
                        node = moveDom;
                        insertBefore(node, $('.dropArea .form-group')[index]);
                    }
                }
            }
            else if (tag.flag == 1)//第一个插入的表单元素
            {
                var node = $(moveDom).clone();

                node.draggable({
                    greedy: true,
                    helper: 'clone',
                    start: dragStart,
                    stop: dragEnd,
                    drag: dragOver,
                    stack: '.form-group'
                });

                console.log('a');

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


});

