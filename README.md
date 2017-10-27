# finalDatavis
<a href="https://caioviktor.github.io/finalDatavis/"> GitPages</a>
<h2>Estrutura de Dados Gerais</h2><br/>
<pre>
	[
		{
			'estado': '*Sigla do estado*',
			'turno1':{
				'quantidade': *quantidade de candidatos*,
				'quantidade_homens': *quantidade de candidatos do sexo masculino*,
				'quantidade_mulheres': *quantidade de candidatas do sexo feminino*,
				'votos_por_partido':[['*Partido*',*quantidade de votos recebidos*],...],
				'candidatos_por_situacao':[['*Situação*',*quantidade de candidatos*],...],
				'eleitos_por_partido':[['*Partido*',*quantidade de candidatos eleitos+eleito por média + eleito por QP*],...],
				'candidatos':*quantidade de candidatos* campo redundante,
				'candidatos_por_escolaridade':[['*escolaridade*',*quantidade de candidatos*],...],
				'candidatos_por_raca':[['*reça*',*quantidade de candidatos*],...],
				'candidatos_por_cassacao':[['*motivo cassação, onde normal não houve*',*quantidade de candidatos*],...],
				'idade_media':*média*,
				'idade_media_eleito':*média*,

			},
			'turno2':{
				Mesma do turno1...
			}
		}
		,...
	]
</pre>
<hr/>
<h2>Estrutura de Dados Estado</h2><br/>
<pre>
	ano_eleicao
	num_turno
	sigla_uf
	descricao_ue : nome da cidade
	descricao_cargo
	nome_candidato
	sequencial_candidato
	cpf_candidato
	nome_urna_candidato
	sigla_partido
	composicao_legenda
	descricao_ocupacao
	data_nascimento
	idade_data_eleicao
	descricao_sexo
	descricao_grau_instrucao
	descricao_estado_civil
	descricao_cor_raca
	descricao_nacionalidade
	sigla_uf_nascimento
	nome_municipio_nascimento
	desc_sit_tot_turno : Se candidato foi eleito ou não
	nm_email
	tipo_de_join : apenas representa se os votos foram computados ou simplesmente não existiam
	votos : quantidade de votos
	cassacao : motivo da cassação é setado como 'normal' caso não tenha ocorrido cassação

</pre>
<b>Os valores entre ** representam o significado do valor armazenado no campo</b>