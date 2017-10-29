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
	window.location=document.URL+"estado.html?q="+estado;
}

function loadGeral(){
	
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
			var resultados = [];
			var cargos = [];
			data.forEach(function(d){
				d.votos = +d.votos;
				d.ano_eleicao = +d.ano_eleicao;
				d.idade_data_eleicao= +d.idade_data_eleicao;
				d.num_turno = +d.num_turno;

				if(resultados.indexOf(d.desc_sit_tot_turno)==-1)
					resultados.push(d.desc_sit_tot_turno);

				if(cargos.indexOf(d.descricao_cargo)==-1)
					cargos.push(d.descricao_cargo);
				
			});
			console.log(cargos);

			//Definição de Gráficos e crossfilter
			// var bar = dc.barChart("#test");
			var bar1 = dc.barChart("#bar1");
			var select1 = dc.selectMenu("#select1");
			var pie1 = dc.pieChart("#pie1");

			var factsQ1 = crossfilter(data);
			
			//Código
			var sexoDim = factsQ1.dimension(function(d){
				return d.descricao_sexo;
			});
			var turnoDim = factsQ1.dimension(function(d){
				return d.num_turno;
			});

			var cargoDim = factsQ1.dimension(function(d){
				return d.descricao_cargo;
			});


			var sexoGroup = sexoDim.group().reduce(function(p,v){
				//p: array cotendo valores para cada camada da barra
				//v:item do dado

				p[v.desc_sit_tot_turno] = (p[v.desc_sit_tot_turno] || 0) + 1;
				return p;
			},function(p,v){

				p[v.desc_sit_tot_turno] = (p[v.desc_sit_tot_turno] || 0) - 1;
				return p;
			},function(p,v){
				//Reduce inicial
				return {};
			});

			function sel_stack(i) {
              return function(d) {
                	return d.value[i];
              };
          	}




			//Condiguração gráficos
			var width = $("#chartDiv1").width();
			var height = $("#chartDiv1").height();
			bar1.width(width/2)
				.height(height)
				.margins({top: 20, right: 50, bottom: 25, left: 140})
				.brushOn(false)
				.dimension(sexoDim)
				.group(sexoGroup,resultados[0],sel_stack(resultados[0]))
				.title(function(d) {return d.key + '[' + this.layer + ']: ' + d.value[this.layer];})
				.x(d3.scale.ordinal())
                .xUnits(dc.units.ordinal)
                .xAxisLabel("Sexo")
                .yAxisLabel("Total de candidatos")
                .renderLabel(true)
                .elasticY(true);

            bar1.legend(dc.legend());
            dc.override(bar1, 'legendables', function() {
	              var items = bar1._legendables();
	              return items.reverse();
	        });
            for(var i = 2; i<resultados.length; ++i){
            	bar1.stack(sexoGroup, ''+resultados[i], sel_stack(resultados[i]));
            }


            pie1.width(width*0.4)
				.height(height/2)
				.slicesCap(6)
				.innerRadius(0)
				.dimension(cargoDim)
				.externalLabels(50)
				.externalRadiusPadding(50)
          		.drawPaths(true)
				.group(cargoDim.group())
				.legend(dc.legend())
				// workaround for #703: not enough data is accessible through .label() to display percentages
				.on('pretransition', function(chart) {
				    chart.selectAll('text.pie-slice').text(function(d) {
				        return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
				    })
				});

            select1.dimension(turnoDim)
				.group(turnoDim.group())
				.controlsUseVisibility(true);


			//Render
			dc.renderAll();
			closeLoad();
		});
	}
}