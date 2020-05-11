$(document).ready(function () {
    console.log("Start.");
    document.getElementById('sectionWithLists').style.display = 'none';

    document.getElementById('input-file').addEventListener('change', getFile);

    document.getElementById('methodSelect').addEventListener('change', function(){
        var decision = document.getElementById('methodSelect').value;
        console.log(decision);

        if (decision === "file"){
            document.getElementById('sectionWithLists').style.display = 'none';
            document.getElementById('sectionWithFile').style.display = '';
        } else {
            document.getElementById('sectionWithFile').style.display = 'none';
            document.getElementById('sectionWithLists').style.display = '';
        }
    })

    $.ajax({
        url: "http://localhost:3000/count",
        type: "GET",
        dataType: "text",
    }).done(function (data) {
        var obj = JSON.parse(data);
        $('#count').append("<p></p>").text("Liczba rekordów w bazie: " + obj.num);
    }).fail({}).always({})

    function getFile(event) {
        const input = event.target;
        if ('files' in input && input.files.length > 0) {
            placeFileContent(
                document.getElementById('content-target'),
                input.files[0])
        }
        document.getElementById('content-target').disabled=true;
    }

    function placeFileContent(target, file) {
        readFileContent(file).then(content => {
            target.value = content
        }).catch(error => console.log(error))
    }

    function readFileContent(file) {
        const reader = new FileReader()
        return new Promise((resolve, reject) => {
            reader.onload = event => resolve(event.target.result)
            reader.onerror = error => reject(error)
            reader.readAsText(file)
        })
    }

    var deleteBtn = document.getElementById('deleteBtn');
    deleteBtn.addEventListener('click', function (event) {
        $.ajax({
            url: 'http://localhost:3000/delete',
            type: 'GET',
            dataType: 'text',
        }).done(function (data){
            location.reload();
        }).fail(function (xhr, status, err){
            console.log("Status: " + status);
            console.log("error: " + err);
        }).always({})   
    })

    document.getElementById('sendList').addEventListener('click', function(event){
        event.preventDefault;
        var listId = document.getElementById('listInput').value;

        $.ajax({
            url: "http://localhost:3000/list/" + listId,
            type: "GET",
            dataType: "text",
        }).done(function (data) {
            var statusBar = $('#status');
            statusBar.addClass("notification");
            statusBar.addClass('is-success');
            var actualDate = new Date();
            var strDate = actualDate.getDate() + "." + actualDate.getMonth() + "." + actualDate.getFullYear() + " " + actualDate.getHours() + ":" + actualDate.getMinutes();
            statusBar.append("<p></p>").text(strDate + ": " + data.status);
        }).fail(function (xhr, status, err) {
            console.log("Status: " + status);
            console.log("error: " + err);
        }).always(function (xhr, status) {})


    })

    var btnTxt = document.getElementById('sendText');
    btnTxt.addEventListener('click', function (event) {
        var contentOnPage = $('#content-target').val().split(/\r|\n/);
        var obj = {
            url: []
        };

        for (let i = 0; i < contentOnPage.length; i++) {
            if (contentOnPage[i]) {
                obj.url.push(contentOnPage[i]);
            }
        }

        event.preventDefault();
        $.ajax({
            url: "http://localhost:3000/add",
            type: "POST",
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            data: JSON.stringify(obj)
        }).done(function (data) {
            var statusBar = $('#status');
            statusBar.addClass("notification");
            statusBar.addClass('is-success');
            var actualDate = new Date();
            var strDate = actualDate.getDate() + "." + actualDate.getMonth() + "." + actualDate.getFullYear() + " " + actualDate.getHours() + ":" + actualDate.getMinutes();
            statusBar.append("<p></p>").text(strDate + ": " + data.status);
        }).fail(function (xhr, status, err) {
            console.log("Status: " + status);
            console.log("error: " + err);
        }).always(function (xhr, status) {})
    })


    var updateBtn = document.getElementById('updateBase');
    updateBtn.addEventListener('click', function (event) {
        event.preventDefault();
        $.ajax({
            url:"http://localhost:3000/update",
            type: "GET",
            dataType: "text",
        }).done(function (data){
            var obj = JSON.parse(data);
            console.log(obj.status);
        }).fail(function (xhr, status, err){
            console.log("Status: " + status);
            console.log("error: " + err);
        }).always({})
    })

    

})