var estadosValidos = ['AC','AL','AM','AP','BA','CE','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']
var pathData = "static/data/"
var pathGeral = pathData+"geral.json"
var rankings = {'1':{},'2':{}};



function changeFilterMap(){
	var filtro = $("#filtro_mapa")[0].value;
	var turno = $("#turno_mapa")[0].value;
	$("#legenda")[0].innerHTML = "";
	drawMap($('#mapa'),rankings[turno][filtro],6);
}

function clickFilter(el){
	var df = $("#d"+el.id)[0];
	if(df.style.display != "block")
		df.style.display = "block";
	else
		df.style.display = "none";
}

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

function orderAscending(lista){
	lista.sort(function(a,b){
		return b[1] - a[1];
	});
}

function topRanking(listaName,turno,arrayData){
	var resultado = {};
	for(var estado in arrayData){
		if(arrayData[estado][turno][listaName].length <= 0)
			continue;
		var top1 = arrayData[estado][turno][listaName][0];
		var lista = [];

		if(resultado[top1[0]])
			lista = resultado[top1[0]];
		else
			resultado[top1[0]] = lista;
		// console.log(lista);
		lista.push([arrayData[estado].estado,top1[1]]);

	}
	var ordenado = [];
	for(var partido in resultado){
		ordenado.push([partido,resultado[partido].length,resultado[partido]])
	}
	ordenado.sort(function(a,b){
		return b[1] - a[1];
	});
	return ordenado;
}
function drawMap(map,lista,maxElements){
	var marks = [];
	if(lista != null){
		// console.log(lista);
		// console.log("entrou");
		colors = ['#fff500',"#e2e2dc","#e56604","#f71a02","#3cbf03","#91018a","#0fedb5","#1710ed"];
		if(maxElements > colors.length)
			maxElements = colors.length;
		if(maxElements > lista.length)
			maxElements = lista.length;
		var cont = 0;
		for(var i in lista){
			if(cont >= maxElements)
				break;
			jQuery('<div/>',{
				id:'item_legenda_'+(i),
				class:'legenda_item'
			}).appendTo("#legenda");

			jQuery('<div/>',{
				id:'color_legenda_'+(i),
				class:'color_legend',
				style:'background-color: '+colors[cont]
			}).appendTo('#item_legenda_'+(i));

			jQuery('<div/>',{
				id:'texto_legenda_'+(i),
				class:'texto_legenda',
				text:lista[i][0]
			}).appendTo('#item_legenda_'+(i));
			
			for(var j in lista[i][2]){
				
			// console.log(lista[i][j]);
				marks.push({'map':'BR.'+lista[i][2][j][0],'color':colors[cont]});
			}
			cont = cont +1;
		}
		jQuery('<div/>',{
				id:'item_legenda_'+(maxElements),
				class:'legenda_item'
			}).appendTo("#legenda");

			jQuery('<div/>',{
				id:'color_legenda_'+(maxElements),
				class:'color_legend',
				style:'background-color: #005dff'
			}).appendTo('#item_legenda_'+(maxElements));
			
			jQuery('<div/>',{
				id:'texto_legenda_'+(maxElements),
				class:'texto_legenda',
				text:'Outros'
			}).appendTo('#item_legenda_'+(maxElements));
	}
	// console.log(marks);
	map.JSC({
			type: 'map',
			annotations: [{
			    label: {
			      text: 'Clique em um estado para visão detalhada',
			      styleFontSize: 14
			    },
			    position: '20,0'
			}],
			series: [{
					map: 'BR',
					points:marks
					// [
						// {'map':'BR.CE','color':'#fff500'},
					// 	{map:'BR.SP',color:'green'},
					// 	{map:'BR.AM',color:'purple'},
					// 	{map:'BR.RJ',color:'black'}
					// ]
					,
					defaultPoint: {
					  eventsClick: selecionarEstado,
					  tooltip: 'Clique para ver detalhado %province'
					},
				}]
			});
}

function loadGeral(){

	// drawMap($('#mapa'),null,6);

	d3.json(pathGeral,function(data){

		var widthL = $("#Q1").width();
		var heightL = $("#Q1").height();


		var maxCandidatos = 0;
		// Tratamento dos dados
		var escolaridades = [];
		var racas = [];
		var quantidade_candidatos = {};
		var eleitos = [];
		for(var estado in data){
			// console.log(data[estado]);
			var v = data[estado];
			if(v.turno1.quantidade_homens + v.turno1.quantidade_mulheres > maxCandidatos)
				maxCandidatos = v.turno1.quantidade_homens + v.turno1.quantidade_mulheres;
			
			orderAscending(v.turno1.candidatos);
			orderAscending(v.turno1.eleitos_por_partido);
			orderAscending(v.turno1.votos_por_partido);

			orderAscending(v.turno2.candidatos);
			orderAscending(v.turno2.eleitos_por_partido);
			orderAscending(v.turno2.votos_por_partido);

			var escolaridade = v.turno1.candidatos_por_escolaridade.map(function(el){
				return {'estado': data[estado].estado,'escolaridade':el[0],'quantidade':el[1]};
			});
			escolaridades = escolaridades.concat(escolaridade);

			var raca = v.turno1.candidatos_por_raca.map(function(el){
				return {'estado': data[estado].estado,'raca':el[0],'quantidade':el[1]};
			});
			racas = racas.concat(raca);

			eleitos = eleitos.concat(v.turno1.eleitos_por_partido);
			eleitos = eleitos.concat(v.turno2.eleitos_por_partido);

			v.turno1.totalCassacoes = 0;
			for(var cassacao = 0; cassacao < v.turno1.candidatos_por_cassacao.length ; cassacao = cassacao+1)
				if(v.turno1.candidatos_por_cassacao[cassacao][0] != "normal")
					v.turno1.totalCassacoes = v.turno1.totalCassacoes + v.turno1.candidatos_por_cassacao[cassacao][1];
			v.turno1.percentualCassacoes = Math.round((v.turno1.totalCassacoes/v.turno1.quantidade) * 10000)/100;
			quantidade_candidatos[v.estado] = [v.turno1.totalCassacoes,v.turno1.quantidade]
		}
		// console.log(data);
		
		rankings['1']['candidatos'] = topRanking('candidatos','turno1',data);
		rankings['1']['votos_por_partido'] = topRanking('votos_por_partido','turno1',data);
		rankings['1']['eleitos_por_partido'] = topRanking('eleitos_por_partido','turno1',data);
		// console.log(data);
		rankings['2']['candidatos'] = topRanking('candidatos','turno2',data);
		rankings['2']['votos_por_partido'] = topRanking('votos_por_partido','turno2',data);
		rankings['2']['eleitos_por_partido'] = topRanking('eleitos_por_partido','turno2',data);

		
		drawMap($('#mapa'),rankings['1']['candidatos'],6);
		// console.log(partidosMaisEleitosPorEstadoT1);

		var bar1 = dc.barChart("#bar1Q1");
		bar1.ordering(function(d){ return - d.value});

		var factsQ = crossfilter(eleitos);

		var eleitosPartidosDim = factsQ.dimension(function(d){
			return d[0];
		});

		var eleitosPartidosGroup = eleitosPartidosDim.group().reduceSum(function(d){
			return d[1];
		});
		
		var maxEleitos = (eleitosPartidosGroup.top(1)[0]).value;

		// console.log(maxEleitos);
		bar1.width(widthL)
			.height(heightL*0.40)
			.brushOn(false)
			.y(d3.scale.linear().domain([0,maxEleitos+ (maxEleitos*0.09)]))
			.margins({top: 50, right: 50, bottom: 25, left: 40})
			.dimension(eleitosPartidosDim)
			.group(eleitosPartidosGroup)
			.x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .xAxisLabel("Partido")
            .renderLabel(true)
            .yAxisLabel("Total de candidatos eleitos");
		//Q2

		//Definição de Gráficos e crossfilter
		var sexos = ['FEMININO','MASCULINO'];
		var bar = dc.barChart("#candidatos");
		bar.ordering(function(d){  return (d.value.MASCULINO-d.value.FEMININO)/(d.value.MASCULINO+d.value.FEMININO)});
		var facts = crossfilter(data);

		// console.log(data);

		
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
		// console.log(candidatosGroup);
		function sel_stack(i) {
              return function(d) {
                	return d.value[i];
              };
          	}

		//Condiguração gráficos





        
		
		bar.width(widthL)
			.height(heightL*0.8)
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

        //Q3
        //Definição de Gráficos e crossfilter
        var factsG3 = crossfilter(escolaridades);
        var pieG1 = dc.pieChart("#pieG1");
        var selectG1 = dc.selectMenu("#selectG1");

        //Código
        var escolaridadeDim = factsG3.dimension(function(d){
        	return d.escolaridade;
        });

        var escolaridadeGroup = escolaridadeDim.group().reduceSum(function(d){
        	return d.quantidade;
        });

        var estadoDimQ3 = factsG3.dimension(function(d){
        	return d.estado;
        });
        
        //Condiguração gráficos
        pieG1.width(widthL)
				.height(heightL*0.8)
				.slicesCap(6)
				.innerRadius(0)
				.dimension(escolaridadeDim)
				.externalLabels(30)
				.externalRadiusPadding(50)
          		.drawPaths(true)
				.group(escolaridadeGroup)
				.legend(dc.legend())
				// workaround for #703: not enough data is accessible through .label() to display percentages
				.on('pretransition', function(chart) {
				    chart.selectAll('text.pie-slice').text(function(d) {
				        return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
				    })
				});

            selectG1.dimension(estadoDimQ3)
				.group(estadoDimQ3.group())
				.multiple(true)
				.numberVisible(10)
				.controlsUseVisibility(true);


		//Q4
        //Definição de Gráficos e crossfilter
        var factsG4 = crossfilter(racas);
        var pieG2 = dc.pieChart("#pieG2");
        var selectG2 = dc.selectMenu("#selectG2");

        //Código
        var racaDim = factsG4.dimension(function(d){
        	return d.raca;
        });

        var racaGroup = racaDim.group().reduceSum(function(d){
        	return d.quantidade;
        });

        var estadoDimQ4 = factsG4.dimension(function(d){
        	return d.estado;
        });
        
        //Condiguração gráficos
        pieG2.width(widthL)
				.height(heightL*0.8)
				.slicesCap(3)
				.innerRadius(0)
				.dimension(racaDim)
				.externalLabels(30)
				.externalRadiusPadding(50)
          		.drawPaths(true)
				.group(racaGroup)
				.legend(dc.legend())
				// workaround for #703: not enough data is accessible through .label() to display percentages
				.on('pretransition', function(chart) {
				    chart.selectAll('text.pie-slice').text(function(d) {
				        return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
				    })
				});

            selectG2.dimension(estadoDimQ4)
				.group(estadoDimQ4.group())
				.multiple(true)
				.numberVisible(10)
				.controlsUseVisibility(true);
		//Render

		//Q5
		//Definição de Gráficos e crossfilter
		
		var factsG5 = crossfilter(data);
		var row1 = dc.rowChart("#row1");
		row1.ordering(function(d){return -d.value});

		//Código
		var idadeDim = factsG5.dimension(function(d){
			return d.estado;
		});
		var idadeGroup = idadeDim.group().reduceSum(function(d){
			return d.turno1.idade_media;
		})
		//Condiguração gráficos
		row1.width(widthL)
			.height(heightL*0.8)
			.dimension(idadeDim)
			.group(idadeGroup)
			.x(d3.scale.linear().domain(d3.extent(data,function(d){return d.turno1.idade_media})))
			// .margins({top: 50, right: 50, bottom: 25, left: 40})
			.elasticX(true);



		//Q6
		//Definição de Gráficos e crossfilter
		
		var factsG6 = crossfilter(data);
		var row2 = dc.rowChart("#row2");
		row2.ordering(function(d){return -d.value});

		//Código
		var idadeDimG6 = factsG6.dimension(function(d){
			return d.estado;
		});
		var idadeGroupG6 = idadeDimG6.group().reduceSum(function(d){
			return d.turno1.idade_media_eleito;
		})
		
		//Condiguração gráficos
		row2.width(widthL)
			.height(heightL*0.8)
			.dimension(idadeDimG6)
			.group(idadeGroupG6)
			.x(d3.scale.linear().domain(d3.extent(data,function(d){return d.turno1.idade_media_eleito})))
			// .margins({top: 50, right: 50, bottom: 25, left: 40})
			.elasticX(true);


		//Q7
		//Definição de Gráficos e crossfilter
		
		var factsG7 = crossfilter(data);
		var row3 = dc.rowChart("#row3");
		row3.ordering(function(d){return -d.value});

		//Código
		var percentualCassacoesDim = factsG7.dimension(function(d){
			return d.estado;
		});
		var percentualCassacoesGroup = percentualCassacoesDim.group().reduceSum(function(d){
			return d.turno1.percentualCassacoes;
		})
		
		//Condiguração gráficos
		row3.width(widthL)
			.height(heightL*0.8)
			.dimension(percentualCassacoesDim)
			.group(percentualCassacoesGroup)
			.x(d3.scale.linear().domain(d3.extent(data,function(d){return d.turno1.percentualCassacoes})))
			// .margins({top: 50, right: 50, bottom: 25, left: 40})
			.title(function(d){
				// return "candidatos:"++"\ncassados:"++"\npercentual de cassados:"+d.value;
				
				return "\npercentual de cassados:"+d.value+"%\nTotal candidatos:"+quantidade_candidatos[d.key][1]+"\nTotal cassações:"+quantidade_candidatos[d.key][0];
			})
			.elasticX(true);


		dc.renderAll();

		function AddXAxis(chartToUpdate, displayText){
		    chartToUpdate.svg()
		                .append("text")
		                .attr("class", "x-axis-label")
		                .attr("text-anchor", "middle")
		                .attr("x", chartToUpdate.width()/2)
		                .attr("y", chartToUpdate.height()-3.5)
		                .text(displayText);
		}
		AddXAxis(row1, "Média de idade");
		AddXAxis(row2, "Média de idade");
		AddXAxis(row3, "Percentual de cassações");
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
			var quantidade_candidatos = {};
			data.forEach(function(d){
				d.votos = +d.votos;
				d.ano_eleicao = +d.ano_eleicao;
				d.idade_data_eleicao= +d.idade_data_eleicao;
				d.num_turno = +d.num_turno;

				if(resultados.indexOf(d.desc_sit_tot_turno)==-1)
					resultados.push(d.desc_sit_tot_turno);

				if(cargos.indexOf(d.descricao_cargo)==-1)
					cargos.push(d.descricao_cargo);
				quantidade_candidatos[d.sigla_partido] = (quantidade_candidatos[d.sigla_partido] || 0) + 1;

			});
			

			//Definição de Gráficos e crossfilter
			// var bar = dc.barChart("#test");
			var bar1 = dc.barChart("#bar1");
			var select1 = dc.selectMenu("#select1");
			// var pie1 = dc.pieChart("#pie1");
			var select9 = dc.selectMenu("#select9");
			

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
			bar1.width(width*0.7)
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


    //         pie1.width(width*0.4)
				// .height(height/2)
				// .slicesCap(6)
				// .innerRadius(0)
				// .dimension(cargoDim)
				// .externalLabels(50)
				// .externalRadiusPadding(50)
    //       		.drawPaths(true)
				// .group(cargoDim.group())
				// .legend(dc.legend())
				// // workaround for #703: not enough data is accessible through .label() to display percentages
				// .on('pretransition', function(chart) {
				//     chart.selectAll('text.pie-slice').text(function(d) {
				//         return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
				//     })
				// });

            select1.dimension(turnoDim)
				.group(turnoDim.group())
				.controlsUseVisibility(true);

			select9.dimension(cargoDim)
					.group(cargoDim.group())
					.controlsUseVisibility(true)
					.multiple(true)
					.numberVisible(6);




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

			var color = d3.rgb('yellow');
			// console.log(color.toString());
			// console.log(color.darker(4).toString());
			var geralGroup = candidatoDim.group();
			
			// var quantize = d3.scale.quantize()
   //                .domain([1,geralGroup.top(1)[0].value])
   //                .range(colorbrewer.Greens[6]);
   			var minValue = geralGroup.top(geralGroup.size())[geralGroup.size()-1].value;
   			var maxValue = geralGroup.top(1)[0].value;
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
				.colors(
						d3.scale.linear().domain([minValue,maxValue])
					      // .interpolate(d3.interpolateHcl)
					      .range([color, color.darker(4)])
					 	// quantize
					    )
				.group(geralGroup)
				.on('preRedraw', function() {
					scatter1.colors(
						d3.scale.linear().domain([minValue,maxValue])
					      // .interpolate(d3.interpolateHcl)
					      .range([color, color.darker(4)])
					 // quantize
					)
				});
				jQuery("<div/>",{
					id:"legendaLinear"

				}).appendTo("#scatter1");

				jQuery("<b/>",{
					text:maxValue

				}).appendTo("#legendaLinear");
				jQuery("<div/>",{
					id:"gradient"

				}).appendTo("#legendaLinear");
				jQuery("<b/>",{
					text:minValue

				}).appendTo("#legendaLinear");


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


			//Chart 4
			//Definição de Gráficos e crossfilter
			var factsQ4 = crossfilter(data);
			var row4 = dc.rowChart("#row4");
			var select10 = dc.selectMenu("#select10");
			//Código
			var partidoDim = factsQ4.dimension(function(d){
				return d.sigla_partido;
			});

			var cassacoesGroup = partidoDim.group().reduceSum(function(d){
				return (d.cassacao != "normal")/(quantidade_candidatos[d.sigla_partido] / 100);
			});
			

			var cargoDim = factsQ4.dimension(function(d){
				return d.descricao_cargo;
			});
			//Condiguração gráficos
			row4.width(width)
			.height(height)
			.dimension(partidoDim)
			.group(cassacoesGroup)
			.x(d3.scale.linear().domain(d3.extent(cassacoesGroup.all(),function(d){return d.value})))
			.margins({top: 50, right: 50, bottom: 25, left: 40})
			.title(function(d){
				// return "candidatos:"++"\ncassados:"++"\npercentual de cassados:"+d.value;
				
				return "\nPercentual de cassações:"+(Math.round(d.value * 100)/100)+"%\nTotal de candidatos:"+quantidade_candidatos[d.key]+"\nTotal de cassações: "+Math.round(quantidade_candidatos[d.key]*(d.value/100));
			})
			.elasticX(true);
			select10.dimension(cargoDim)
					.group(cargoDim.group())
					.multiple(true)
					.numberVisible(10)
					.controlsUseVisibility(true);
			//Render
			dc.renderAll();
			closeLoad();
		});
	}
}

