var estadosValidos = ['AC','AL','AM','AP','BA','CE','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']
var pathData = "static/data/"
var pathGeral = pathData+"geral.json"

function pathEstado(estado){
	return pathData+estado+"/data.csv"
}

function closeLoad(){
	$("#load")[0].style.display="none";
}

function selecionarEstado(){
	var point = this;
	console.log(point);
	var id = point.tokenValue('%mapCode');
	var estado = id.split(".")[1];
	if(estado=="DF")
		return null;
	window.location="/estado.html?q="+estado;
}

function loadGeral(){
	d3.json(pathGeral,function(data){
		
		
		//Tratamento dos dados
		// for(var estado in data){
		// 	// console.log(data[estado]);
		// }

		//Definição de Gráficos e crossfilter

		var bar = dc.barChart("#candidatos");
		bar.ordering(function(d){ return -d.value});
		var facts = crossfilter(data);
		
		//Código
		var candidatosDim = facts.dimension(function(d){
			return d.estado;
		});
		var candidatosGroup = candidatosDim.group().reduceSum(function(d){
			return d.turno1.quantidade;
		});


		//Condiguração gráficos
		
		bar.width(600)
			.height(600)
			.margins({top: 50, right: 50, bottom: 25, left: 40})
			.dimension(candidatosDim)
			.group(candidatosGroup)
			.x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .xAxisLabel("Estado")
            .yAxisLabel("Total de candidatos");



		//Render
		dc.renderAll();
		closeLoad();
	});
	$('#mapa').JSC({
	  type: 'map',
	  series: [{
	    map: 'BR',
	    defaultPoint: {
	      eventsClick: selecionarEstado,
	      tooltip: 'Clique para ver detalhado %province'
	    }
	  }]
	});
}

function loadEstado(){
	var url = new URL(document.URL);
	var estado = url.searchParams.get("q");
	if(estado == null || estadosValidos.indexOf(estado) == -1){
		$("#erro_estado")[0].style.display ="block";
		$("#content")[0].style.display ="none";

	}else{
		d3.csv(pathEstado(estado),function(data){
			
			//Tratamento dos dados
			data.forEach(function(d){
				d.votos = +d.votos;
			});


			//Definição de Gráficos e crossfilter
			var bar = dc.barChart("#test");

			var facts = crossfilter(data);
			
			//Código
			var sexoDim = facts.dimension(function(d){
				return d.descricao_sexo;
			});

			var sexoGroup = sexoDim.group();



			//Condiguração gráficos
			bar.width(400)
				.height(600)
				.margins({top: 50, right: 50, bottom: 25, left: 40})
				.dimension(sexoDim)
				.group(sexoGroup)
				.x(d3.scale.ordinal())
                .xUnits(dc.units.ordinal)
                .xAxisLabel("Sexo")
                .yAxisLabel("Total de candidatos");




			//Render
			dc.renderAll();
			closeLoad();
		});
	}
}