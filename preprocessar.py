from pyspark import SparkConf, SparkContext
from pyspark.sql import SQLContext


def toCSV(data):
	return ','.join(str(d) for d in data)


conf = (SparkConf()
         .setMaster("local")
         .setAppName("My app")
         .set("spark.executor.memory", "1g"))
sc = SparkContext(conf = conf)
estados = ['AC','AL','AM','AP','BA','CE','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']
# estados = ['CE']

dadosGerais = {}
# text = sc.textFile("file:///home/caio/datavis/datavis/recorte/votos/*.txt,file:///home/caio/datavis/datavis/recorte/candidatos/*.txt,file:///home/caio/datavis/datavis/recorte/cassacao/*.txt").map(lambda linha: linha.split(";"))
raiz = "/home/caio/datavis/datavis/"
nameFileGeral = raiz+"/processados/geral.json"
def gerarTemp(estado):
	ano = '2014'
	ano2 = '2016'
	temp = open(raiz+"temp.txt","w")
	temp.write("")
	temp.close()
	files = [raiz+"consulta_cand_"+ano+"/consulta_cand_"+ano+"_"+estado+".txt",raiz+"votacao_candidato_munzona_"+ano+"/votacao_candidato_munzona_"+ano+"_"+estado+".txt",raiz+"motivo_cassacao_"+ano2+"/motivo_cassacao_"+ano2+"_"+estado+".txt",raiz+"consulta_cand_"+ano2+"/consulta_cand_"+ano2+"_"+estado+".txt",raiz+"votacao_candidato_munzona_"+ano2+"/votacao_candidato_munzona_"+ano2+"_"+estado+".txt",raiz+"motivo_cassacao_"+ano2+"/motivo_cassacao_"+ano2+"_"+estado+".txt"]
	for path in files:
		file = open(path,"rb")
		temp = open(raiz+"temp.txt","a")
		for line in file:
			temp.write(line.decode('latin1'))
		temp.close()
		file.close()



def processar(estado):
	nameFile = raiz+"/processados/"+estado
	print("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\nGerando arquivo temporário para o estado:"+estado+"\n")
	gerarTemp(estado)
	print("-------------------------------------------------------\nProcessando o estado "+estado+" \n")
	text = sc.textFile("file://"+raiz+"temp.txt").map(lambda linha: linha.split(";"))

	projecaoVotos = text.filter(lambda fato: len(fato) == 30).map(lambda cd: (str(cd[2]).strip('"')+"_"+str(cd[3]).strip('"')+"_"+str(cd[12]).strip('"'),int(str(cd[28]).strip('"')))).reduceByKey(lambda v1,v2: v1+v2).map(lambda cd:(cd[0],('a',cd[1])))
	projecaoCandidatos = text.filter(lambda fato: len(fato) == 46).map(lambda cd: (str(cd[2]).strip('"')+"_"+str(cd[3]).strip('"')+"_"+str(cd[11]).strip('"'),(str(cd[2]).strip('"'),str(cd[3]).strip('"'),str(cd[5]).strip('"'),str(cd[7]).strip('"'),str(cd[9]).strip('"'),str(cd[10]).strip('"'),str(cd[11]).strip('"'),str(cd[13]).strip('"'),str(cd[14]).strip('"'),str(cd[18]).strip('"'),str(cd[22]).strip('"'),str(cd[25]).strip('"'),str(cd[26]).strip('"'),str(cd[28]).strip('"'),str(cd[30]).strip('"'),str(cd[32]).strip('"'),str(cd[34]).strip('"'),str(cd[36]).strip('"'),str(cd[38]).strip('"'),str(cd[39]).strip('"'),str(cd[41]).strip('"'),str(cd[44]).strip('"'),str(cd[45]).strip('"'))))
	projecaoCassacoes = text.filter(lambda fato: len(fato) == 9).map(lambda cd: (str(cd[7]).strip('"'),(str(cd[8]).strip('"'))))
	# eleitos = text.filter(lambda candidato: candidato[21].lower() != '"não eleito"').sortBy(lambda candidato: int(str(candidato[28]).strip('"')),ascending=False).map(lambda candidato:(candidato[2],candidato[5],candidato[14],candidato[15],candidato[21],candidato[28]))
	
	juncaoCandidatosVotos = projecaoCandidatos.leftOuterJoin(projecaoVotos).map(lambda cd: (cd[1][0][6],(sum(cd[1],()))) if cd[1][1] else (cd[1][0][6],(cd[1][0]+('b',0))))
	juncaoCandidatosVotosCassacao = juncaoCandidatosVotos.leftOuterJoin(projecaoCassacoes).map(lambda cd: (cd[1][0]+(cd[1][1],)) if cd [1][1] else (cd[1][0]+('normal',)))
	
	header = ['ano_eleicao','num_turno','sigla_uf','descricao_ue','descricao_cargo','nome_candidato','sequencial_candidato','cpf_candidato','nome_urna_candidato','sigla_partido','composicao_legenda','descricao_ocupacao','data_nascimento','idade_data_eleicao','descricao_sexo','descricao_grau_instrucao','descricao_estado_civil','descricao_cor_raca','descricao_nacionalidade','sigla_uf_nascimento','nome_municipio_nascimento','desc_sit_tot_turno','nm_email','tipo_de_join','votos','cassacao']

	sqlContext = SQLContext(sc)
	df = sqlContext.createDataFrame(juncaoCandidatosVotosCassacao, header)
	# Write CSV (I have HDFS storage)
	df.coalesce(1).write.format('com.databricks.spark.csv').options(header='true').save('file://'+nameFile)
	

	resumo = {'estado':estado}
	turno1 = {}
	turno2 = {}

	turnoT1 = projecaoCandidatos.filter(lambda c: c[1][1]=='1').map(lambda c: c[1])
	turnoT2 = projecaoCandidatos.filter(lambda c: c[1][1]=='2').map(lambda c: c[1])

	turno1['quantidade'] = turnoT1.count()
	turno2['quantidade'] = turnoT2.count()

	homensT1 = turnoT1.filter(lambda c: c[14]=='MASCULINO')
	homensT2 = turnoT2.filter(lambda c: c[14]=='MASCULINO')

	mulheresT1 = turnoT1.filter(lambda c: c[14]=='FEMININO')
	mulheresT2 = turnoT2.filter(lambda c: c[14]=='FEMININO')

	turno1['quantidade_homens'] = homensT1.count()
	turno2['quantidade_homens'] = homensT2.count()
	turno1['quantidade_mulheres'] = mulheresT1.count()
	turno2['quantidade_mulheres'] = mulheresT2.count()	


	# votosTurno1 = projecaoVotos.filter(lambda v: (v[0])[5]=='1').map(lambda v: (v[1][0],v[1][1])).reduceByKey(lambda a,b:a+b)

	# votosTurno2 = projecaoVotos.filter(lambda v: (v[0])[5]=='2').map(lambda v: (v[1][0],v[1][1])).reduceByKey(lambda a,b:a+b)


	# turno1['quantidade_votos'] = (votosTurno1.collect())[0][1]
	# turno2['quantidade_votos'] = (votosTurno2.collect())[0][1]

	totalT1 = juncaoCandidatosVotosCassacao.filter(lambda t: t[1]=='1')
	totalT2 = juncaoCandidatosVotosCassacao.filter(lambda t: t[1]=='2')


	partidosVotosT1 = totalT1.map(lambda t: (t[9],t[24])).reduceByKey(lambda a,b:a+b)
	partidosVotosT2 = totalT2.map(lambda t: (t[9],t[24])).reduceByKey(lambda a,b:a+b)

	turno1['votos_por_partido'] = partidosVotosT1.collect()
	turno2['votos_por_partido'] = partidosVotosT2.collect()

	turno1['candidatos_por_situacao'] = totalT1.map(lambda d:(d[21],1)).reduceByKey(lambda a,b:a+b).collect()
	turno2['candidatos_por_situacao'] = totalT2.map(lambda d:(d[21],1)).reduceByKey(lambda a,b:a+b).collect()

	turno1['eleitos_por_partido'] = totalT1.filter(lambda d: d[21] == 'ELEITO POR MÉDIA' or d[21] == 'ELEITO POR QP' or d[21] == 'ELEITO').map(lambda t: (t[9],1)).reduceByKey(lambda a,b:a+b).collect()
	turno2['eleitos_por_partido'] = totalT2.filter(lambda d: d[21] == 'ELEITO POR MÉDIA' or d[21] == 'ELEITO POR QP' or d[21] == 'ELEITO').map(lambda t: (t[9],1)).reduceByKey(lambda a,b:a+b).collect()

	turno1['candidatos'] = totalT1.map(lambda t: (t[9],1)).reduceByKey(lambda a,b:a+b).collect()
	turno2['candidatos'] = totalT2.map(lambda t: (t[9],1)).reduceByKey(lambda a,b:a+b).collect()

	turno1['candidatos_por_escolaridade'] = totalT1.map(lambda d: (d[15],1)).reduceByKey(lambda a,b:a+b).collect()
	turno2['candidatos_por_escolaridade'] = totalT2.map(lambda d: (d[15],1)).reduceByKey(lambda a,b:a+b).collect()


	turno1['candidatos_por_raca'] = totalT1.map(lambda d: (d[17],1)).reduceByKey(lambda a,b:a+b).collect()
	turno2['candidatos_por_raca'] = totalT2.map(lambda d: (d[17],1)).reduceByKey(lambda a,b:a+b).collect()
	

	turno1['candidatos_por_cassacao'] = totalT1.map(lambda d: (d[25],1)).reduceByKey(lambda a,b:a+b).collect()
	turno2['candidatos_por_cassacao'] = totalT2.map(lambda d: (d[25],1)).reduceByKey(lambda a,b:a+b).collect()

	turno1['idade_media'] = totalT1.map(lambda d: int(d[13])).mean()
	turno2['idade_media'] = totalT2.map(lambda d: int(d[13])).mean()

	turno1['idade_media_eleito'] = totalT1.filter(lambda d: d[21] == 'ELEITO POR MÉDIA' or d[21] == 'ELEITO POR QP' or d[21] == 'ELEITO').map(lambda d: int(d[13])).mean()
	turno2['idade_media_eleito'] = totalT2.filter(lambda d: d[21] == 'ELEITO POR MÉDIA' or d[21] == 'ELEITO POR QP' or d[21] == 'ELEITO').map(lambda d: int(d[13])).mean()





	resumo['turno1'] = turno1
	resumo['turno2'] = turno2
	dadosGerais[estado] = resumo


if __name__ == "__main__":
	for estado in estados:
		try:
			processar(estado)
		except Exception as e:
			print("Estado: "+estado+"\n"+str(e))
	print("\nEscrevendo dados gerais\n")
	geral = open(nameFileGeral,"w")
	geral.write(str(dadosGerais))
	geral.close()
	print("Processo terminado!!!\n")


