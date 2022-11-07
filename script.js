const ovner = "-208251009";
const getCommentsMethod = "https://api.vk.com/method/photos.getComments?access_token="
let pointer = 0;

function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var time = date + ' ' + month + ' ' + year + ' ';
  return time + a.toLocaleTimeString("it-IT");
}

const requestVK = (card, index) => {
  let url = `${getCommentsMethod}${token}&owner_id=${ovner}&photo_id=${card}&sort=desc&count=2&v=5.131`;
  $.ajax({url: url, type: 'GET', dataType: 'jsonp'})
  .done(function(data) {
    let digitPtrStart;
    let digitPtrEnd;
    const str = data.response.items[0].text.split('\n')[2];
    for (var i = 0; i < str.length; i++) {
      if (parseInt(str.substring(i, i + 1)) || parseInt(str.substring(i, i + 1)) === 0) {
        if (!digitPtrStart) digitPtrStart = i;
        digitPtrEnd = i;
      }
      if (parseInt(str.substring(i, i + 1)) === NaN && digitPtrStart) break;
    }
    console.log(card, index);
    console.log(str);
    console.log(parseInt(str.substring(digitPtrStart, digitPtrEnd + 1)));
    martellArr[index].amount = parseInt(str.substring(digitPtrStart, digitPtrEnd + 1));
    martellArr[index].date = timeConverter(data.response.items[0].date);
  });
}

function tableMarkupFromObjectArray(obj) {
  let headers = `
  <th>Index</th>
  ${Object.keys(obj[0]).map((col) =>`
    <th>${col}</th>`
    ).join('')}`

  let content = obj.map((row, idx) => `
    <tr>
    <td>${idx + 1}</td>
    ${Object.values(row).map((datum) => `
      <td>${datum}</td>`
      ).join('')}
    </tr>
    `).join('')

  let tablemarkup = `
  <table class="table table-sm table-striped">
  ${headers}
  ${content}
  </table>
  `
  return tablemarkup
}

const setInt = () => {
  intervalId = setInterval(() => {
    if (pointer < martellArr.length) {
      requestVK(martellArr[pointer].card, pointer);
      pointer++;
    }else {
      clearInterval(intervalId);
    }
    document.querySelector("#mydiv").innerHTML = tableMarkupFromObjectArray(martellArr)
  },350);
}

const copyNames = () => {
  let str = '';
  martellArr.forEach(elem => {
    str += elem.name + '\n';
  });
  navigator.clipboard.writeText(str);
}

const copyValues = () => {
  let str = '';
  martellArr.forEach(elem => {
    str += elem.amount + '\n';
  });
  navigator.clipboard.writeText(str);
}

document.querySelector("#request").onclick = () => {setInt()};
document.querySelector("#table").onclick = () => {document.querySelector("#mydiv").innerHTML = tableMarkupFromObjectArray(martellArr)};
document.querySelector("#cpVal").onclick = () => {copyValues()};
document.querySelector("#cpNames").onclick = () => {copyNames()};



