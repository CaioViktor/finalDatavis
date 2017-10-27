var estadosValidos = ['AC','AL','AM','AP','BA','CE','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']
var pathData = "static/data/"
var pathGeral = pathData+"geral.json"

function pathEstado(estado){
	return pathData+estado+"/data.csv"
}

function loadGeral(){
	d3.json(pathGeral,function(data){
		
		
		//Tratamento dos dados
		for(var estado in data){
			console.log(data[estado]);
		}

		//Definição de Gráficos e crossfilter


		var facts = crossfilter(data);
		
		//Código
		


		//Condiguração gráficos
		




		//Render
		dc.renderAll();
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

		});
	}
}