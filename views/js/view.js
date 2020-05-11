$(document).ready(function () {

    let table = document.querySelector("#raport");
  
    $('#followersSort').on('click', function (event) {
      var rowCount = table.rows.length;
      if (rowCount > 0) {
        $('#raport tr').remove();
        getTableFromDb('followers')
      } else {
        getTableFromDb('followers')
      }
    })
  
    $('#tweetSorty').on('click', function (event) {
      var rowCount = table.rows.length;
      if (rowCount > 0) {
        $('#raport tr').remove();
        getTableFromDb('tweets')
      } else {
        getTableFromDb('tweets')
      }
    })
  
    function getTableFromDb(type) {
      if (type === 'followers') {
        $.ajax({
          url: "http://localhost:3000/all",
          type: "GET",
          dataType: "text",
        }).done(function (data) {
          var list = JSON.parse(data);
          let table = document.querySelector("#raport");
          let dataToTable = Object.keys(list[0])
          generateTableHead(table, dataToTable);
          generateTable(table, list);
  
        }).fail(function (xhr, status, err) {
          console.log("Status: " + status);
          console.log("error: " + err);
        }).always({})
      } else if (type === 'tweets') {
        $.ajax({
          url: "http://localhost:3000/tweetSort",
          type: "GET",
          dataType: "text",
        }).done(function (data) {
          var list = JSON.parse(data);
          let table = document.querySelector("#raport");
          let dataToTable = Object.keys(list[0])
          generateTableHead(table, dataToTable);
          generateTable(table, list);
  
        }).fail(function (xhr, status, err) {
          console.log("Status: " + status);
          console.log("error: " + err);
        }).always({})
      }
    }
  
    function generateTableHead(table, data) {
      let thead = table.createTHead();
      let row = thead.insertRow();
      for (let key of data) {
        let th = document.createElement("th");
        th.classList.add('is-selected')
        let text = document.createTextNode(key);
        th.appendChild(text);
        row.appendChild(th);
      }
    }
  
    function generateTable(table, data) {
      let tbody = table.appendChild(document.createElement('tbody'))
      for (let element of data) {
        let row = tbody.insertRow();
        for (key in element) {
          let cell = row.insertCell();
          let text = document.createTextNode(element[key]);
          cell.appendChild(text);
        }
      }
    }
  
  
  })