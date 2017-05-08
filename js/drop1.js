$(function () {
    $('.dragArea .form-group').draggable({
        connectToSortable: ".dropArea",
        // helper: "clone",
        revert: "invalid"
    });

    $(".dropArea").sortable({
    });

    var target ;

    $('.form-group').draggable({
        helper: "clone",
        drag:function () {
            target = this;
        }

    });
    $('.three').droppable({
        hoverClass: ".active",
        drop:function (e) {
            this.appendChild(target.cloneNode(true));
        }
    });

});

