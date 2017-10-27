pathData = "static/data/"
pathGeral = pathData+"geral.json"

function pathEstado(estado){
	return pathData+estado+"/data.csv"
}

function loadGeral(){
	d3.json(pathGeral,function(data){
		data.forEach(function(d){

		});
	});
}

function loadEstado(){
	
}