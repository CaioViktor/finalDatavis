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
			var layers1 = [];
			data.forEach(function(d){
				d.votos = +d.votos;
				d.ano_eleicao = +d.ano_eleicao;
				d.idade_data_eleicao= +d.idade_data_eleicao;
				d.num_turno = +d.num_turno;
				if(layers1.indexOf(d.desc_sit_tot_turno)==-1)
					layers1.push(d.desc_sit_tot_turno);
			});


			//Definição de Gráficos e crossfilter
			// var bar = dc.barChart("#test");
			var bar1 = dc.barChart("#bar1");
			// var pie1 = dc.pieChart("#pie1");

			var factsQ1 = crossfilter(data);
			
			//Código
			var sexoDim = factsQ1.dimension(function(d){
				return d.descricao_sexo;
			});


			var sexoGroup = sexoDim.group().reduce(function(p,v){
				//p: array cotendo valores para cada camada da barra
				//v:item do dado
				//Reduce para adicionar
				// console.log("p+:");
				// console.log(p);
				// console.log("v+:");
				// console.log(v);
				p[v.desc_sit_tot_turno] = (p[v.desc_sit_tot_turno] || 0) + 1;
				return p;
			},function(p,v){
				//Reduce para remover
				// console.log("p-:");
				// console.log(p);
				// console.log("v-:");
				// console.log(v);
				p[v.desc_sit_tot_turno] = (p[v.desc_sit_tot_turno] || 0) - 1;
				return p;
			},function(p,v){
				//Reduce inicial
				return {};
			});

			function sel_stack(i) {
              return function(d) {
              		// console.log(d);
                	return d.value[i];
              };
          	}




			//Condiguração gráficos
			bar1.width(600)
				.height(600)
				.margins({top: 50, right: 50, bottom: 25, left: 140})
				.dimension(sexoDim)
				.group(sexoGroup,layers1[0],sel_stack(layers1[0]))
				.title(function(d) {return d.key + '[' + this.layer + ']: ' + d.value[this.layer];})
				.x(d3.scale.ordinal())
                .xUnits(dc.units.ordinal)
                .xAxisLabel("Sexo")
                .yAxisLabel("Total de candidatos")
                .renderLabel(true);

            bar1.legend(dc.legend());
            dc.override(bar1, 'legendables', function() {
	              var items = bar1._legendables();
	              return items.reverse();
	        });
            for(var i = 2; i<layers1.length; ++i){
            	bar1.stack(sexoGroup, ''+layers1[i], sel_stack(layers1[i]));
            }


			//Render
			dc.renderAll();
			closeLoad();
		});
	}
}