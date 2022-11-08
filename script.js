const ovner = "-208251009";
const getCommentsMethod = "https://api.vk.com/method/photos.getComments?access_token="
let url1;
let factionNameUserData = [];
let arrStark = [];
let arrArryn = [];

let rangeToGet = (arr) => {
	switch (arr) {
		case "stark":
			return "Старки!A2:D100";
			break;
		case "arryn":
			return "Аррены!A2:D100";
			break;
	}
}


// "Старки!A2:D100";

async function getGoogleSheetData(query, functionToCall, arr) {
	const apiKey = "AIzaSyBO4Dr_pF5AWGbs_WloloNOnoqYvmFBVBQ";
	const sheet = "1J0yQJjQdYMS8wWd7icDBFqsVJsNBgqxsLCxQM_NGn5E";
	let result = await fetch(
		`https://sheets.googleapis.com/v4/spreadsheets/${sheet}/values/${query}?key=${apiKey}`
		)
	.then(async (response) => {
		return await response.json();
	})
	.then((returnedData) => functionToCall(returnedData, arr))

	.catch((err) => console.log("fetch failed ", err));
}

function doSomethingWithData(data, arr) {
	let array = arraySwith(arr)
	console.log(array);
	data.values.forEach((row) => {
		if (row[1] === "TRUE") {
			row[3] = "inactive";
			row[2] = "inactive";
		}
		array.push({ name: row[0], id: row[2], card: row[3] });
	});
	document.querySelector("#mydiv" + arr).innerHTML = tableMarkupFromObjectArray(array);
	console.log(array);//заменить на вызов функции работающей с этими данными
}
// тут имена и айди вместе

// getGoogleSheetData(rangeToGet, doSomethingWithData);

function timeConverter(UNIX_timestamp){
	var a = new Date(UNIX_timestamp * 1000);
	var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	var year = a.getFullYear();
	var month = months[a.getMonth()];
	var date = a.getDate();
	var time = date + ' ' + month + ' ' + year + ' ';
	return time + a.toLocaleTimeString("it-IT");
}

const requestVK = (card, index, array) => {
	if (card === "inactive") {
		array[index].amount = "inactive";
		array[index].date = "inactive";
	}else {
		let url = `${getCommentsMethod}${token}&owner_id=${ovner}&photo_id=${card}&sort=desc&count=2&v=5.131`;
		url1 = url;
		$.ajax({url: url, type: 'GET', dataType: 'jsonp'})
		.done(function(data) {
			let digitPtrStart;
			let digitPtrEnd;
			const str = data.response.items[0].text.split('\n')[2];
			if (!str) {
				array[index].amount = 'ERROR';
				array[index].date = timeConverter(data.response.items[0].date);
			}else {
				for (var i = 0; i < str.length; i++) {
					if (parseInt(str.substring(i, i + 1)) || parseInt(str.substring(i, i + 1)) === 0) {
						if (!digitPtrStart) digitPtrStart = i;
						digitPtrEnd = i;
					}
					if (parseInt(str.substring(i, i + 1)) === NaN && digitPtrStart) break;
				}
				console.log(card, index);
				console.log(str);
				let result = parseInt(str.substring(digitPtrStart, digitPtrEnd + 1));
				console.log(result);
				array[index].amount = result;
				array[index].date = timeConverter(data.response.items[0].date);
			}

		});
	}
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

const arraySwith = (arr) => {
	switch	(arr) {
		case "stark":
			return arrStark;
			break;
		case "arryn":
			return arrArryn;
			break;
	}
}

const setInt = (arr) => {
	let pointer = 0;
	const array = arraySwith(arr);
	intervalId = setInterval(() => {
		if (pointer < array.length) {
			requestVK(array[pointer].card, pointer, array);
			pointer++;
		}else {
			clearInterval(intervalId);
		}
		document.querySelector("#mydiv" + arr).innerHTML = tableMarkupFromObjectArray(array)
	},350);
}

const copyNames = () => {
	let str = '';
	factionNameUserData.forEach(elem => {
		str += elem.name + '\n';
	});
	navigator.clipboard.writeText(str);
}

const copyValues = () => {
	let str = '';
	factionNameUserData.forEach(elem => {
		if (elem.amount === "inactive") {
			str += '\n';
		}else str += elem.amount + '\n';
	});
	navigator.clipboard.writeText(str);
}

document.querySelector("#requestStark").onclick = () => {setInt('stark')};
document.querySelector("#requestDbStark").onclick = () => {getGoogleSheetData(rangeToGet('stark'), doSomethingWithData, ('stark'))};
document.querySelector("#cpValStark").onclick = () => {copyValues()};

document.querySelector("#requestArryn").onclick = () => {setInt('arryn')};
document.querySelector("#requestDbArryn").onclick = () => {getGoogleSheetData(rangeToGet('arryn'), doSomethingWithData, ('arryn'))};
// document.querySelector("#cpValStark").onclick = () => {copyValues()};


// document.querySelector("#table").onclick = () => {document.querySelector("#mydiv").innerHTML = tableMarkupFromObjectArray(factionNameUserData)};
// "https://oauth.vk.com/authorize?client_id=51469310&display=page&scope=photos,wall,offline&response_type=token&v=5.131&state=123456" - Получить токен!!!