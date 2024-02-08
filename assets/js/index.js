$("div#pipe").click(function () {
    var taskState = $(this).val();
    //alert(val);
    if (taskState == "weightOption") {
        $("input#submergedweight").attr("disabled", true);
    } else {
        $("input#submergedweight").attr("disabled", false);
    }
});

