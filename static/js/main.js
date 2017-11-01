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
	    // points:[
	    // 	{map:'BR.CE',color:'red'},
	    // 	{map:'BR.SP',color:'green'},
	    // 	{map:'BR.AM',color:'purple'},
	    // 	{map:'BR.RJ',color:'black'}
	    // ],
	    defaultPoint: {
	      eventsClick: selecionarEstado,
	      tooltip: 'Clique para ver detalhado %province'
	    }
	  }]
	});


	d3.json(pathGeral,function(data){
		
		
		var maxCandidatos = 0;
		// Tratamento dos dados
		for(var estado in data){
			// console.log(data[estado]);
			var v =data[estado];
			if(v.turno1.quantidade_homens + v.turno1.quantidade_mulheres > maxCandidatos)
				maxCandidatos = v.turno1.quantidade_homens + v.turno1.quantidade_mulheres;
		}

		//Definição de Gráficos e crossfilter
		var sexos = ['FEMININO','MASCULINO'];
		var bar = dc.barChart("#candidatos");
		bar.ordering(function(d){  return (d.value.MASCULINO-d.value.FEMININO)/(d.value.MASCULINO+d.value.FEMININO)});
		var facts = crossfilter(data);
		
		//Código
		var candidatosDim = facts.dimension(function(d){
			return d.estado;
		});
		var candidatosGroup = candidatosDim.group().reduce(function(p,v){
			//Add
			p['MASCULINO'] = (p[v.turno1.quantidade_homens] || 0) + v.turno1.quantidade_homens;
			p['FEMININO'] = (p[v.turno1.quantidade_mulheres] || 0) + v.turno1.quantidade_mulheres;
			return p;
		},function(p,v){
			//Remove
			p['MASCULINO'] = (p[v.turno1.quantidade_homens] || 0) - v.turno1.quantidade_homens;
			p['FEMININO'] = (p[v.turno1.quantidade_mulheres] || 0) - v.turno1.quantidade_mulheres;
			return p;
		},function(p,v){
			//Init
			return {};
		});
		console.log(candidatosGroup);
		function sel_stack(i) {
              return function(d) {
                	return d.value[i];
              };
          	}

		//Condiguração gráficos




		
		var width = $("#chartDiv1").width();
		var height = $("#chartDiv1").height();

        
		
		bar.width(width/2)
			.height(height)
			.brushOn(false)
			.y(d3.scale.linear().domain([0,maxCandidatos+ (maxCandidatos*0.05)]))
			.margins({top: 50, right: 50, bottom: 25, left: 40})
			.dimension(candidatosDim)
			.group(candidatosGroup,sexos[0],sel_stack(sexos[0]))
			.title(function(d) {return d.key + '[' + this.layer + ']: ' + d.value[this.layer]+"\n"+(100*(d.value[this.layer])/(d.value.MASCULINO+d.value.FEMININO))+"%";})
			.x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .xAxisLabel("Estado")
            .renderLabel(true)
            .yAxisLabel("Total de candidatos");
        bar.legend(dc.legend());
        dc.override(bar, 'legendables', function() {
              var items = bar._legendables();
              return items.reverse();
        });
        for(var i = 1; i<sexos.length; ++i){
        	bar.stack(candidatosGroup, ''+sexos[i], sel_stack(sexos[i]));
        }


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
			var escolaridades = {
				"SUPERIOR COMPLETO":7,
				"SUPERIOR INCOMPLETO":6,
				"ENSINO MÉDIO COMPLETO":5,
				"ENSINO MÉDIO INCOMPLETO":4,
				"ENSINO FUNDAMENTAL COMPLETO":3,
				"ENSINO FUNDAMENTAL INCOMPLETO":2,
				"LÊ E ESCREVE":1,
				"ANALFABETO":0
			};
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

          	console.log(sexoGroup);


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
                // .y(d3.scale.linear().domain([0,maxCandidatos+ (maxCandidatos*0.05)]))
                .xAxisLabel("Sexo")
                .yAxisLabel("Total de candidatos")
                .renderLabel(true)
                .elasticY(true);

            bar1.legend(dc.legend());
            dc.override(bar1, 'legendables', function() {
	              var items = bar1._legendables();
	              return items.reverse();
	        });
            for(var i = 1; i<resultados.length; ++i){
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


			//Chart 2


			// Definição de Gráficos e crossfilter
			var scatter1 = dc.scatterPlot("#scatter1");
			scatter1.ordering(function(d) {return escolaridades[d.key[0]]; });
			
			var select2 = dc.selectMenu("#select2");
			var select3 = dc.selectMenu("#select3");
			var select4 = dc.selectMenu("#select4");

			var factsQ2 = crossfilter(data);
			// console.log(factsQ2);
			//Código
			var candidatoDim = factsQ2.dimension(function(d){
				return [d.descricao_grau_instrucao,
						d.idade_data_eleicao]}
			);
			var cargosDim = factsQ2.dimension(function(d){
				return d.descricao_cargo;
			});

			var partidosDim = factsQ2.dimension(function(d){
				return d.sigla_partido;
			});

			var eleitosDim = factsQ2.dimension(function(d){
				if(d.desc_sit_tot_turno == 'ELEITO POR MÉDIA' || d.desc_sit_tot_turno == 'ELEITO POR QP' || d.desc_sit_tot_turno == 'ELEITO')
					return 'ELEITO';
				return d.desc_sit_tot_turno;
			});

			var geralGroup = candidatoDim.group();
			
			//Condiguração gráficos
			

			scatter1.width(width)
				.height(height)
				.x(d3.scale.ordinal())
				.xUnits(dc.units.ordinal)
				.brushOn(false)
				.symbolSize(8)
				.elasticY(true)
				.clipPadding(10)
				.yAxisLabel("Idade")
				.dimension(candidatoDim)
				.colorAccessor(function(d){
					return d.value;
				})
				.colors(d3.scale.linear().domain([1,geralGroup.top(1)[0].value])
					      .interpolate(d3.interpolateHcl)
					      .range([d3.rgb("#007AFF"), d3.rgb('#FFF500')]))
				.group(geralGroup)
				.on('preRedraw', function() {
					scatter1.colors(d3.scale.linear().domain([1,geralGroup.top(1)[0].value])
					      .interpolate(d3.interpolateHcl)
					      .range([d3.rgb("#007AFF"), d3.rgb('#FFF500')]))
				});
				



			select2.dimension(partidosDim)
					.group(partidosDim.group())
					.multiple(true)
					.numberVisible(10)
					.controlsUseVisibility(true);

			select3.dimension(cargosDim)
					.group(cargosDim.group())
					.multiple(true)
					.numberVisible(10)
					.controlsUseVisibility(true);
			select4.dimension(eleitosDim)
				.group(eleitosDim.group())
				.controlsUseVisibility(true);



			//Chart 3
			//Definição de Gráficos e crossfilter
			var pie2 = dc.pieChart("#pie2");
			var select5 = dc.selectMenu("#select5");
			var select6 = dc.selectMenu("#select6");
			var select7 = dc.selectMenu("#select7");
			var select8 = dc.selectMenu("#select8");

			var factsQ3 = crossfilter(data);
			//Código

			var racasSexoDim = factsQ3.dimension(function(d){
				return [d.descricao_sexo,d.descricao_cor_raca];
			});

			var turnoDim = factsQ3.dimension(function(d){
				return d.num_turno;
			});

			var cargoDim = factsQ3.dimension(function(d){
				return d.descricao_cargo;
			});
			var partidosDim = factsQ3.dimension(function(d){
				return d.sigla_partido;
			});
			var eleitosDim = factsQ3.dimension(function(d){
				if(d.desc_sit_tot_turno == 'ELEITO POR MÉDIA' || d.desc_sit_tot_turno == 'ELEITO POR QP' || d.desc_sit_tot_turno == 'ELEITO')
					return 'ELEITO';
				return d.desc_sit_tot_turno;
			});

			//Condiguração gráficos
			pie2.width(width)
				.height(height)
				.slicesCap(6)
				.innerRadius(0)
				.dimension(racasSexoDim)
				.externalLabels(50)
				.externalRadiusPadding(50)
          		.drawPaths(true)
				.group(racasSexoDim.group())
				.legend(dc.legend())
				// workaround for #703: not enough data is accessible through .label() to display percentages
				.on('pretransition', function(chart) {
				    chart.selectAll('text.pie-slice').text(function(d) {
				        return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
				    })
				});

			select5.dimension(turnoDim)
					.group(turnoDim.group())
					.controlsUseVisibility(true);
			select6.dimension(cargoDim)
					.group(cargoDim.group())
					.multiple(true)
					.numberVisible(10)
					.controlsUseVisibility(true);
			select7.dimension(partidosDim)
					.group(partidosDim.group())
					.multiple(true)
					.numberVisible(10)
					.controlsUseVisibility(true);

			select8.dimension(eleitosDim)
				.group(eleitosDim.group())
				.controlsUseVisibility(true);
		//Render
			dc.renderAll();
			closeLoad();
		});
	}
}
